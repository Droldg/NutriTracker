const express = require('express'); // Her importeres Express frameworket til at oprette routere
const router = express.Router(); // Her oprettes der en router ved hjælp af Express
const mssql = require('mssql'); // Her importeres MSSQL biblioteket til at arbejde med SQL Server
const { pool, poolPromise } = require('../database'); // Her importeres databaseforbindelsen fra en database.js fil

// Endpoint til at hente kategorier af aktiviteter
// Endpoint til at hente kategorier
router.get('/categories', async (req, res) => {
    try {
        await poolPromise; //Sikrer at forbindelsen er klar før database forespørgsler udføres
        const result = await pool.request().query('SELECT DISTINCT Kategori FROM dbo.aktivitetData');
        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error: Unable to fetch categories.");
    }
});

// Endpoint til at hente aktiviteter baseret på en specifik kategori
router.get('/activities/:category', async (req, res) => {
    let category;
    try {
        await poolPromise; // Sikrer at forbindelsen er klar før database forespørgsler udføres
        category = req.params.category; // Henter kategori fra URL-parametre
        const result = await pool.request()
            .input('Kategori', mssql.NVarChar, category) // Bruger parameteriseret SQL for at undgå SQL-injektion
            .query('SELECT AktivitetsNavn, KcalPerTime FROM dbo.aktivitetData WHERE Kategori = @Kategori');
        res.json(result.recordset); // Sender aktivitetsnavne og kalorier brændt per time tilbage som JSON
    } catch (error) {
        console.error("Error fetching activities for category:", category, error);
        res.status(500).send("Internal Server Error: Unable to fetch activities.");
    }
});

// Endpoint til at gemme en brugers aktivitet
router.post('/trackActivity', async (req, res) => {
    const { username, activityName, caloriesBurned, duration, activityDate } = req.body;

    // Her valideres modtagne data
    if (!username || !activityName || caloriesBurned == null || duration == null || !activityDate) { // Hvis nogle af felterne mangler, sendes en 400 fejl
        console.log('Validation error: Some fields are missing');
        return res.status(400).send('Missing or invalid data');
    }

    try {
        await poolPromise; // Sikrer at forbindelsen er klar før database forespørgsler udføres
        const result = await pool.request() // Indsætter aktiviteten i databasen
            .input('Username', mssql.NVarChar, username)
            .input('ActivityName', mssql.NVarChar, activityName)
            .input('CaloriesBurned', mssql.Int, Math.round(caloriesBurned))
            .input('Duration', mssql.Decimal(10, 2), duration)
            .input('ActivityDate', mssql.DateTime, new Date(activityDate))
            .query(`INSERT INTO dbo.brugerAktivitetData (Username, ActivityName, CaloriesBurned, Duration, ActivityDate)
                    VALUES (@Username, @ActivityName, @CaloriesBurned, @Duration, @ActivityDate);`);
        res.status(200).json({ message: 'Aktivitet gemt!' }); // Her bekræftes, at aktiviteten er gemt
    } catch (error) {
        console.error('Error saving activity:', error);
        res.status(500).send('Internal Server Error: Unable to save activity.');
    }
});

// Endpoint til at hente brugeroplysninger (vægt, højde, alder, køn)
router.get('/userDetails/:username', async (req, res) => { // Henter brugeroplysninger baseret på brugernavn
    const username = req.params.username; 
    try {
        await poolPromise; // Sikrer at forbindelsen er klar før database forespørgsler udføres
        const result = await pool.request()
            .input('Username', mssql.NVarChar, username)
            .query('SELECT Weight, Height, Age, Gender FROM dbo.brugerData WHERE Username = @Username');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Sender brugeroplysninger tilbage som JSON
        } else {
            res.status(404).send('User not found'); // Hvis brugeren ikke bliver fundet, sendes en 404 fejl.
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error: Unable to fetch user details.');
    }
});

module.exports = router; // Eksporterer routeren, så den kan bruges i andre dele af applikationen
