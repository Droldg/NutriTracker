// Importerer nødvendige moduler
const express = require('express'); // Her importeres Express frameworket til at oprette routere
const router = express.Router(); // Her oprettes der en router ved hjælp af Express
const mssql = require('mssql'); // Her importeres MSSQL biblioteket til at arbejde med SQL Server
const { pool } = require('../database');// Her importeres databaseforbindelsen fra en database.js fil

// Endpoint til at hente al information relateret til en specifik bruger ved brug af brugernavnet.
// Dette endpoint anvendes til at hente både aktiviteter og måltider samt andre trackerdata.
router.get('/getUserInformation/:username', async (req, res) => {
    try {
        // Udpakker brugernavnet fra URL-parameteren.
        const { username } = req.params;

        //  SQL-forespørgsel til at hente aktivitetsdata for brugeren.
        const activityDataQuery = `
            SELECT *
            FROM dbo.brugerAktivitetData
            WHERE Username = @username;
        `;

        // SQL-forespørgsel til at hente måltidsdata for brugeren.
        const mealsQuery = `
            SELECT *
            FROM dbo.brugerMåltider
            WHERE Username = @username;
        `;

        // SQL-forespørgsel til at hente trackerdata for brugeren.
        const trackerDataQuery = `
            SELECT *
            FROM dbo.brugerTracker
            WHERE Username = @username;
        `;

        // Her udføres de tre SQL-forespørgsler asynkront ved hjælp af MSSQL connection pool.
        const activityDataResult = await pool.request() 
            .input('username', mssql.NVarChar, username)
            .query(activityDataQuery);

        const mealsResult = await pool.request() 
            .input('username', mssql.NVarChar, username)
            .query(mealsQuery);

        const trackerDataResult = await pool.request()
            .input('username', mssql.NVarChar, username)
            .query(trackerDataQuery);

        // Her samles alle hentede data i et objekt med specifikke nøgler for hver datakilde.
        const userData = { 
            activityData: activityDataResult.recordset,
            meals: mealsResult.recordset,
            trackerData: trackerDataResult.recordset
        };

        // Sender de samlede data til klienten som JSON.
        res.json(userData);
    } catch (error) {
        // Logger eventuelle fejl og sender en fejlmeddelelse til klienten.
        console.error('Fejl ved hentning af brugeroplysninger:', error);
        res.status(500).send('Der opstod en fejl ved hentning af brugeroplysninger.');
    }
});

// Endpoint til at hente alders- og kønsinformation for en specifik bruger.
router.get('/getUserAge/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // SQL-forespørgsel til at hente alders- og kønsoplysninger for brugeren.
        const query = `
            SELECT Gender, Age
            FROM dbo.brugerData
            WHERE Username = @username;
        `;

        // Her udføres SQL-forespørgslen og henter resultatet.
        const result = await pool.request()
            .input('username', mssql.NVarChar, username)
            .query(query);

        // Her hentes alders- og kønsoplysninger fra resultatsættet.
        const userInfo = result.recordset[0];

        // Sender alders- og kønsoplysningerne som JSON til klienten.
        res.json(userInfo);
    } catch (error) {
        // Logger og håndterer eventuelle fejl ved databasen forespørgsel.
        console.error('Error fetching user info:', error);
        res.status(500).send('Error fetching user info');
    }
});

// Eksporterer ruterne, så de kan anvendes i andre dele af applikationen.
module.exports = router;
