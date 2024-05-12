const express = require('express'); // Her importeres Express frameworket til at oprette routere
const router = express.Router(); // Her oprettes der en router ved hjælp af Express
const mssql = require('mssql'); // Her importeres MSSQL biblioteket til at arbejde med SQL Server
const { pool, poolPromise } = require('../database'); // Her importeres databaseforbindelsen fra en anden fil
const cors = require('cors');

router.use(cors()); // Aktiverer CORS for alle ruter i denne router, hvilket tillader anmodninger fra andre domæner

// Endpoint til at søge efter fødevarer baseret på en søgestreng
router.get('/searches/:searchString', async (req, res) => {
    try {
        const searchString = req.params.searchString; // Henter søgestrengen fra URL-parametre
        await poolPromise; // Sikrer, at databasetilslutningen er klar før udførelse af SQL-forespørgsel

        // Her udføres en SQL-forespørgsel for at finde fødevarer, hvor navnet indeholder søgestrengen
        // Her bruges TOP 10 til at begrænse resultaterne til de første 10 poster
        const result = await pool.request().query(`SELECT TOP 10 * FROM [dbo].[FRIDA-OPSLAG] WHERE FoodName LIKE '%${searchString}%'`);
        
        res.json(result.recordset); // Sender de fundne fødevarer tilbage som JSON
        console.log(result.recordset); // Logger resultaterne til serverens konsol
    } catch (error) {
        console.error("Fejl ved indhentning af søgninger:", error);
        res.status(500).send("Internal Server Error: Kunne ikke hente søgninger."); // Sender en fejlmeddelelse, hvis noget går galt
    }
});

// Endpoint til at foreslå fødevarer baseret på fødevare-ID
router.get('/parametre/:foodID', async (req, res) => {
    try {
        const foodID = req.params.foodID; // Henter fødevare-ID fra URL-parametre
        await poolPromise; // Sikrer at databasetilslutningen er klar

        // Udfører en SQL-forespørgsel for at hente specifikke næringsoplysninger for en fødevare
        // Vælger kun poster hvor sort-nøglerne er relevante for ernæringsinformation (kalorier, protein osv.)
        const result = await pool.request().query(`
            SELECT * FROM [dbo].[FRIDA]
            WHERE FoodID = ${foodID} AND (SortKey = 1030 OR SortKey = 1110 OR SortKey = 1310 OR SortKey = 1240);
        `);
        
        res.json(result.recordset); // Sender de fundne data tilbage som JSON
        console.log(result.recordset); // Logger de hentede data til serverens konsol
    } catch (error) {
        console.error("Fejl ved indhentning af fødevareparametre:", error);
        res.status(500).send("Internal Server Error: Kunne ikke hente fødevareparametre."); // Sender en fejlmeddelelse, hvis der opstår fejl
    }
});

module.exports = router; // Eksporterer routeren for at gøre den tilgængelig i andre dele af applikationen
