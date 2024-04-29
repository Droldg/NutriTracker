const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Konfiguration af SQL Server-forbindelsesparametre
const config = {
    user: 'kali', // Erstatt med dit brugernavn
    password: 'Densortesatan1234', // adgangskode
    server: 'nutritracker-cbs.database.windows.net', // SQL Server-serveradresse
    database: 'NutriTracker', // database
    options: {
        encrypt: true, // Sørg for at aktivere kryptering
        trustServerCertificate: true // Brug dette kun, hvis du kører på Windows Azure
    }
};

// Opret en SQL Server-pool
const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

// Logger HTTP-anmodninger til konsollen
app.use(morgan('dev'));

// Tillad CORS-anmodninger for alle endpoints
app.use(cors());

// Middleware til at parse JSON-anmodninger
app.use(express.json());

// Endpoint til at tjekke om en bruger allerede eksisterer
app.post('/checkExistingUser', async (req, res) => {
    try {
        // Modtag data fra anmodningen
        const { username, phoneNumber, email } = req.body;

        // SQL-forespørgsel for at tjekke om brugeren allerede eksisterer
        const query = `
            SELECT COUNT(*) AS count
            FROM dbo.brugerData
            WHERE Username = @username OR PhoneNumber = @phoneNumber OR Email = @email;
        `;

        console.log('Modtaget anmodning med data:', { username, phoneNumber, email });
        console.log('Udført SQL-forespørgsel:', query);

        // Udfør forespørgslen
        const result = await pool.request()
            .input('username', mssql.NVarChar, username)
            .input('phoneNumber', mssql.NVarChar, phoneNumber)
            .input('email', mssql.NVarChar, email)
            .query(query);

        // Hent antallet af rækker, hvor brugernavn, telefonnummer eller e-mail eksisterer
        const count = result.recordset[0].count;

        // Returner resultatet som JSON
        res.json({ count: count });
    } catch (error) {
        console.error('Fejl ved behandling af forespørgsel:', error);
        res.status(500).send('Der opstod en fejl ved behandling af din anmodning.');
    }
});

app.post('/registerUser', async (req, res) => {
    try {
        // Udpak dataene fra anmodningen
        const { navn, email, phoneNumber, age, gender, weight, height, username, password } = req.body;

        // SQL-forespørgsel til at indsætte dataene i databasen
        const query = `
            INSERT INTO dbo.brugerData (FullName, Email, PhoneNumber, Age, Gender, Weight, Height, Username, Password)
            VALUES (@navn, @email, @phoneNumber, @age, @gender, @weight, @height, @username, @password);
        `;

        // Udfør forespørgslen
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

        // Send svar til klienten
        res.send('Brugeren er nu oprettet mvh express');
    } catch (error) {
        console.error('Der er sgu sket en fejl:', error);
        res.status(500).send('Der opstod en fejl under behandling af din anmodning.');
    }
});

app.post('/checkLogin', async (req, res) => {
    try {
        // Hent brugernavn og password fra anmodningen
        const { username, password } = req.body;

        // Eksempel på SQL-forespørgsel for at tjekke brugernavn og password i databasen
        const query = `
            SELECT COUNT(*) AS match
            FROM dbo.brugerData
            WHERE Username = @username AND Password = @password;
        `;

        // Udfør forespørgslen
        const result = await pool.request()
            .input('username', mssql.NVarChar, username)
            .input('password', mssql.NVarChar, password)
            .query(query);

        // Hent antallet af rækker, hvor brugernavn og password matcher
        const matchCount = result.recordset[0].match;

        // Returner resultatet som JSON
        res.json({ match: matchCount === 1 });
    } catch (error) {
        console.error('Fejl ved behandling af login-forespørgsel:', error);
        res.status(500).send('Der opstod en fejl ved behandling af din login-forespørgsel.');
    }
});







// Lyt efter anmodninger på port 3000
app.listen(3000, () => {
    console.log('Serveren kører på port 3000');
});
