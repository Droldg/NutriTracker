const express = require('express');  // Her importeres Express frameworket til at oprette routere
const mssql = require('mssql');  // Her importeres MSSQL biblioteket til at arbejde med SQL Server
const { pool, poolPromise } = require('../database');  // Her importeres databaseforbindelsen fra en database.js fil
const router = express.Router();  // Her oprettes der en router ved hjælp af Express

// Endpoint til at tjekke om en bruger allerede eksisterer i databasen
router.post('/checkExistingUser', async (req, res) => {
    try {
        // Her modtages brugernavn, telefonnummer og email fra request body
        const { username, phoneNumber, email } = req.body;

        // SQL-forespørgsel for at finde antallet af eksisterende brugere med samme brugernavn, telefon eller email
        const query = `
            SELECT COUNT(*) AS count
            FROM dbo.brugerData
            WHERE Username = @username OR PhoneNumber = @phoneNumber OR Email = @email;
        `;

        // Denne kode her udfører forespørgslen med sikkerhedsparametre for at undgå SQL-injektion
        const result = await pool.request() 
            .input('username', mssql.NVarChar, username)
            .input('phoneNumber', mssql.NVarChar, phoneNumber)
            .input('email', mssql.NVarChar, email)
            .query(query);

        // Her hentes antallet af eksisterende brugere fra forespørgselsresultatet
        const count = result.recordset[0].count;

        // Her sendes resultatet tilbage til klienten
        res.json({ count: count });
    } catch (error) {
        console.error('Fejl ved behandling af forespørgsel:', error);
        res.status(500).send('Der opstod en fejl ved behandling af din anmodning.'); 
    }
});

// Endpoint til at registrere en ny bruger
router.post('/registerUser', async (req, res) => {
    try {
        // Her udpakkes brugeroplysninger fra request body
        const { navn, email, phoneNumber, age, gender, weight, height, username, password } = req.body;

        // SQL-forespørgsel til at indsætte den nye bruger i databasen
        const query = `
            INSERT INTO dbo.brugerData (FullName, Email, PhoneNumber, Age, Gender, Weight, Height, Username, Password)
            VALUES (@navn, @email, @phoneNumber, @age, @gender, @weight, @height, @username, @password);
        `;

        // Her udføres forespørgslen og indsæt dataene
        const result = await pool.request()
            .input('navn', mssql.NVarChar, navn)
            .input('email', mssql.NVarChar, email)
            .input('phoneNumber', mssql.NVarChar, phoneNumber)
            .input('age', mssql.NVarChar, age)
            .input('gender', mssql.NVarChar, gender)
            .input('weight', mssql.NVarChar, weight)
            .input('height', mssql.NVarChar, height)
            .input('username', mssql.NVarChar, username)
            .input('password', mssql.NVarChar, password)
            .query(query);

        // Derefter bekræfter registreringen til klienten
        res.send('Brugeren er nu oprettet!');
    } catch (error) {
        console.error('Der er sket en fejl ved registrering:', error);
        res.status(500).send('Der opstod en fejl under behandling af din anmodning.');
    }
});

// Endpoint til at validere brugerlogin
router.post('/checkLogin', async (req, res) => {
    try {
        // Her henter brugernavn og password fra anmodningen
        const { username, password } = req.body;

        // SQL-forespørgsel for at tjekke, om der findes en match på brugernavn og password
        const query = `
            SELECT COUNT(*) AS match
            FROM dbo.brugerData
            WHERE Username = @username AND Password = @password;
        `;

        // Her udføres forespørgslen og hent resultatet
        const result = await pool.request()
            .input('username', mssql.NVarChar, username)
            .input('password', mssql.NVarChar, password)
            .query(query);

        // Her tjekkes der om der er fundet et match. Hvis der er, så er brugernavn og password korrekt
        const matchCount = result.recordset[0].match;

        // Her sendes resultatet tilbage som JSON
        res.json({ match: matchCount === 1 });
    } catch (error) {
        console.error('Fejl ved login-forespørgsel:', error);
        res.status(500).send('Der opstod en fejl ved behandling af din login-forespørgsel.');
    }
});

// Endpoint til at opdatere eksisterende brugeroplysninger
router.put('/redigerBruger', async (req, res) => {
    try {
        // Henter opdaterede data fra request body
        const { username, age, gender, weight, height, password } = req.body;

        // Nedenstående er en SQL-forespørgsel til at opdatere brugeroplysninger baseret på brugernavnet
        const query = `
            UPDATE dbo.brugerData
            SET Age = @age,
                Gender = @gender,
                Weight = @weight,
                Height = @height,
                Password = @password
            WHERE Username = @username;
        `;

        // Her udføres opddateringen af brugeroplysninger
        const result = await pool.request()
            .input('username', mssql.NVarChar, username)
            .input('age', mssql.NVarChar, age)
            .input('gender', mssql.NVarChar, gender)
            .input('weight', mssql.NVarChar, weight)
            .input('height', mssql.NVarChar, height)
            .input('password', mssql.NVarChar, password)
            .query(query);

        // Her bekræftes opdateringen til klienten
        res.json({ message: 'Brugeroplysninger opdateret.' });
    } catch (error) {
        console.error('Fejl ved opdatering af bruger:', error);
        res.status(500).json({ message: 'Der opstod en fejl under opdatering af brugeroplysninger.' });
    }
});

// Endpoint til at slette en bruger og relaterede data
router.delete('/sletProfil', async (req, res) => {
    const { brugernavn } = req.body;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // Starter med at slette afhængige data i 'brugerMåltidIngredienser'. Dette skyldes at tabellen har en fremmednøgle til 'brugerData'
        await transaction.request()
            .input('brugernavn', mssql.NVarChar, brugernavn)
            .query(`DELETE FROM dbo.brugerMåltidIngredienser WHERE Username = @brugernavn;`);
        // Her defineres en liste over tabeller, hvor brugerdata skal slettes.
        // Disse tabeller har alle en fremmednøgle, der refererer til 'brugerData' tabellen.
        const tablesToDelete = [
            'dbo.brugerAktivitetData',
            'dbo.brugerMåltider',
            'dbo.brugerTracker'
        ];

        // Iterer over hver tabel i listen.
        for (const table of tablesToDelete) {
            // For hver tabel, oprettes en ny forespørgsel i transaktionen.
            // Dertil bliver brugernavnet indsat som en parameter i forespørgslen.
            // Derefter udfører en SQL DELETE forespørgsel for at slette alle rækker, hvor 'Username' kolonnen matcher det givne brugernavn.
            await transaction.request()
                .input('brugernavn', mssql.NVarChar, brugernavn)
                .query(`DELETE FROM ${table} WHERE Username = @brugernavn;`);
        }

        // Efter at have slettet alle afhængige data, slettes brugerens hoveddata fra 'brugerData' tabellen.
        // Dette er muligt, fordi der ikke længere er nogen fremmednøgler, der refererer til denne bruger.
        await transaction.request()
            .input('brugernavn', mssql.NVarChar, brugernavn)
            .query(`DELETE FROM dbo.brugerData WHERE Username = @brugernavn;`);

        // Efter at alle sletningsforespørgsler er blevet udført med succes, committer transaktionen.
        // Dette gør alle ændringerne permanente i databasen.
        await transaction.commit();
        res.json({ message: 'Brugeren og alle relaterede data blev slettet.' });
        // Dette forhindrer, at databasen ender i en inkonsistent tilstand, hvor nogle data er blevet slettet, men andre ikke.
    } catch (error) {
        await transaction.rollback();
        console.error('Fejl ved sletning af bruger:', error);
        res.status(500).json({ message: 'Der opstod en fejl under sletning af brugeren.', error: error.message });
    }
});

module.exports = router;  // Eksporter routeren for at gøre den tilgængelig i andre dele af applikationen
