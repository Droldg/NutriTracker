const express = require('express');
const mssql = require('mssql');

const app = express();

// Konfiguration af SQL Server-forbindelsesparametre
const config = {
    user: 'kali', // Erstatt med dit brugernavn
    password: 'Densortesatan1234', // Erstatt med din adgangskode
    server: 'nutritracker-cbs.database.windows.net', // Erstatt med din SQL Server-serveradresse
    database: 'NutriTracker', // Erstatt med navnet på din database
    options: {
        encrypt: true, // Sørg for at aktivere kryptering
        trustServerCertificate: true // Brug dette kun, hvis du kører på Windows Azure
    }
};

// Endpoint for at håndtere SQL-forespørgsler
app.get('/query', async (req, res) => {
    try {
        // Opret forbindelse til SQL Server
        await mssql.connect(config);

        // Udfør SQL-forespørgsel
        const result = await mssql.query('SELECT TOP (1000) * FROM [dbo].[login]');

        // Send resultatet som svar
        res.json(result.recordset);
    } catch (error) {
        console.error('Fejl under udførelse af SQL-forespørgsel:', error.message);
        res.status(500).send('Der opstod en fejl under behandling af din forespørgsel.');
    } finally {
        // Luk forbindelsen til SQL Server
        mssql.close();
    }
});

// Lyt efter anmodninger på port 3000
app.listen(3000, () => {
    console.log('Serveren kører på port 3000');
});