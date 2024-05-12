const express = require('express'); // Her importers Express frameworket
const mssql = require('mssql'); // Her importeres mssql biblioteket til at arbejde med Microsoft SQL Server
const { poolPromise } = require('../database'); // Her importeres databaseforbindelsen fra en database.js fil
const router = express.Router(); // Her oprettes en router ved hjælp af Express

// Routes til MealTrackerSQL.js

// Endpoint til slet et sporet måltid
router.delete('/deleteTrackedMeal/:trackerID', async (req, res) => {
    const { trackerID } = req.params;  // Her hentes trackerID fra URL parameter
    try {
        const pool = await poolPromise; // Her oprettes en forbindelse til databasen ved hjælp af poolPromise
        const result = await pool.request()
            .input('TrackerID', mssql.Int, trackerID)  // Her angives trackerID som input til SQL-forespørgslen
            .query(`
                DELETE FROM dbo.brugerTracker
                WHERE TrackerID = @TrackerID
            `);
        res.send("Tracked meal deleted successfully."); // Hvis alt er gået rigtigt, kommer der en succesbesked til klienten
    } catch (error) {
        console.error("Error deleting tracked meal:", error);
        res.status(500).send("Failed to delete tracked meal."); // Hvis der er sket en fejl, vil der komme en fejlbesked til klienten
    }
});

// Endpoint til at opdatere et sporet måltid
router.put('/editTrackedMeal/:trackerID', async (req, res) => {
    const { trackerID } = req.params;  // Henter trackerID fra URL parameter
    const { grams, liters, isWater } = req.body;  // Her antages det at 'liters' og 'isWater' sendes fra frontend

    try {
        const pool = await poolPromise; // Her bliver der oprettet en forbindelse til databasen ved hjælp af poolPromise
        const transaction = new mssql.Transaction(pool); // Her oprettes en transaktion
        await transaction.begin(); // Her starter transaktionen
        // Nedenunder laves et if-else statement, som tjekker om det er vand eller mad, der skal opdateres.
        if (isWater) {
            // Her opdateres kun vandmængden for vandindtag. Derfor er der kun en forespørgsel.
            await pool.request()
                .input('Liters', mssql.Float, liters)
                .input('TrackerID', mssql.Int, trackerID)
                .query(`UPDATE dbo.brugerTracker SET WaterConsumed = @Liters WHERE TrackerID = @TrackerID`);
        } else {
            // Her hentes de nuværende data for måltidet.
            let mealData = await pool.request()
                .input('TrackerID', mssql.Int, trackerID)
                .query(`SELECT TotalGrams, TotalCalories, TotalProtein, TotalFat, TotalFibers FROM dbo.brugerTracker WHERE TrackerID = @TrackerID`);

            if (!mealData.recordset.length) {
                throw new Error('Meal not found'); // Hvis måltidet ikke findes, bliver der vist en fejl.
            }

            let { TotalGrams, TotalCalories, TotalProtein, TotalFat, TotalFibers } = mealData.recordset[0];

            // Udregning af nye værdier baseret på det nye antal gram
            TotalCalories = (TotalCalories / TotalGrams) * grams;
            TotalProtein = (TotalProtein / TotalGrams) * grams;
            TotalFat = (TotalFat / TotalGrams) * grams;
            TotalFibers = (TotalFibers / TotalGrams) * grams;

            // Opdatering af måltidet med de nye værdier
            await pool.request() 
                .input('Grams', mssql.Float, grams)
                .input('TotalCalories', mssql.Float, TotalCalories)
                .input('TotalProtein', mssql.Float, TotalProtein)
                .input('TotalFat', mssql.Float, TotalFat)
                .input('TotalFibers', mssql.Float, TotalFibers)
                .input('TrackerID', mssql.Int, trackerID)
                .query(`
                    UPDATE dbo.brugerTracker
                    SET 
                        TotalGrams = @Grams,
                        TotalCalories = @TotalCalories,
                        TotalProtein = @TotalProtein,
                        TotalFat = @TotalFat,
                        TotalFibers = @TotalFibers
                    WHERE TrackerID = @TrackerID
                `);
        }

        await transaction.commit(); // Udføresel af transaktionen
        res.json({ status: 'success', message: 'Meal updated successfully' }); // Der sendes en succesbesked til klienten, hvis alt er gået godt
    } catch (error) {
        await transaction.rollback(); // Hvis der bliver "catchet" en error, rulles transaktionen tilbage.
        console.error("Error updating meal:", error);
        res.status(500).send({ status: 'error', message: 'Failed to update meal', error: error.message }); // Her bliver der sendt en fejlbesked til klienten
    }
});

// Endpoint til at hente alle sporede måltider for en bruger
router.get('/getTrackedMeals/:username', async (req, res) => {
    try {
        const { username } = req.params;  // Her hentes brugernavn fra URL parameter (localStorage)
        const pool = await poolPromise; // Her oprettes en forbindelse til databasen ved hjælp af poolPromise
        const result = await pool.request()
            .input('Username', mssql.NVarChar, username)  // Her angives brugernavn som input til SQL-forespørgslen
            .query(`
                SELECT TrackerID, MealName, MealType, TotalGrams, TotalCalories, TotalProtein, TotalFat, TotalFibers, WaterConsumed, LocationLatitude, LocationLongitude, CreationDate 
                FROM dbo.brugerTracker
                WHERE Username = @Username
                ORDER BY CreationDate DESC
            `);
        res.json(result.recordset); //Resultatet bliver sendt til klienten
    } catch (error) {
        console.error("Error fetching tracked meals:", error);
        res.status(500).send("Unable to fetch tracked meals."); // Her sendes en fejlbesked til klienten.
    }
});




// Routes til MealTracker2SQL.js


// Endpoint til at tilføj et nyt sporet måltid
router.post('/addTrackedMeal', async (req, res) => {
    const {
        username,
        mealName,
        mealType,
        totalGrams,
        totalCalories,
        totalProtein,
        totalFat,
        totalFibers,
        waterConsumed,
        locationLatitude,
        locationLongitude
    } = req.body;  // Her modtages måltidsinformation fra anmodningen

    if (!username || !mealName || !mealType) { // Her tjekkes om der mangler information
        return res.status(400).send("Missing meal information.");  // Her bliver inputet valideret, og returner fejl hvis nødvendig information mangler
    }

    const pool = await poolPromise; // Her oprettes en forbindelse til databasen ved hjælp af poolPromise
    const transaction = new mssql.Transaction(pool);  // Her startes en ny database transaktion

    try {
        await transaction.begin();  // Her startes transaktionen

        // Nedenstående er en SQL-forespørgsel til at tilføje måltidet
        const mealInsertQuery = `
            INSERT INTO dbo.brugerTracker (Username, MealName, MealType, TotalGrams, TotalCalories, TotalProtein, TotalFat, TotalFibers, WaterConsumed, LocationLatitude, LocationLongitude, CreationDate)
            VALUES (@Username, @MealName, @MealType, @TotalGrams, @TotalCalories, @TotalProtein, @TotalFat, @TotalFibers, @WaterConsumed, @LocationLatitude, @LocationLongitude, DATEADD(hour, 2, GETDATE()));
        `;
        // Her indsættes måltidsinformationen i databasen
        const mealInsert = new mssql.Request(transaction);
        mealInsert.input('Username', mssql.NVarChar, username);
        mealInsert.input('MealName', mssql.NVarChar, mealName);
        mealInsert.input('MealType', mssql.NVarChar, mealType);
        mealInsert.input('TotalGrams', mssql.Float, totalGrams);
        mealInsert.input('TotalCalories', mssql.Float, totalCalories);
        mealInsert.input('TotalProtein', mssql.Float, totalProtein);
        mealInsert.input('TotalFat', mssql.Float, totalFat);
        mealInsert.input('TotalFibers', mssql.Float, totalFibers);
        mealInsert.input('WaterConsumed', mssql.Float, waterConsumed);
        mealInsert.input('LocationLatitude', mssql.Float, locationLatitude);
        mealInsert.input('LocationLongitude', mssql.Float, locationLongitude);

        await mealInsert.query(mealInsertQuery); // Her udføres SQL-forespørgslen
        await transaction.commit(); // Udføring af transaktionen
        res.json({ status: 'success', message: 'Meal tracked successfully' }); // Her sendes en succesbesked til klienten
    } catch (error) {
        await transaction.rollback(); // Her rulles transaktionen tilbage i tilfælde af fejl
        console.error("Error saving tracked meal:", error);
        res.status(500).json({ status: 'error', message: 'Failed to track meal' }); // Sender en fejlbesked til klienten
    }
});

// Endpoint til at hente måltider for en bruger
router.get('/getMeals/:username', async (req, res) => {
    try {
        const { username } = req.params;  // Her hentes brugernavn fra URL parameter (localStorage)
        const pool = await poolPromise; // Oprettelse af en forbindelse til databasen ved hjælp af poolPromise
        const result = await pool.request() 
            .input('Username', mssql.VarChar, username)  // Angiver brugernavn som input til SQL-forespørgslen
            .query(`
                SELECT MealName, CaloriesPer100g, ProteinPer100g, FatPer100g, FibersPer100g 
                FROM dbo.brugerMåltider 
                WHERE Username = @Username
            `);
        res.json(result.recordset); // Sender resultatet til klienten
    } catch (error) {
        console.error("Error fetching meals:", error);
        res.status(500).send("Unable to fetch meals."); // Sender en fejlbesked til klienten
    }
});

module.exports = router; // Eksportér routeren til brug i andre filer




// De nedenstående endpoints er skrevet som kommentarer, da de bruges i MealTracker2SQL.js filen. 
// Præcis samme endpoints er skrevet i MealCreatorRoute.js og vi genbruger dem derfor.
// Dette skyldes særligt, at vi oplevede fejl i MealCreator2SQL.js, hvor der var problemer med at hente data fra databasen.

/*// Endpoint for sikker søgning efter fødevarer
router.get('/searchFood', async (req, res) => {
    const searchText = req.query.search; // Henter søgeteksten fra query-parameter
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SearchText', mssql.VarChar, `%${searchText}%`)
            .query('SELECT DISTINCT FoodID, FoodName FROM dbo.FRIDA WHERE FoodName LIKE @SearchText');
        res.json(result.recordset); // Sender resultatet som JSON
    } catch (error) {
        console.error("Error fetching food items:", error);
        res.status(500).send("Unable to fetch food items."); // Fejl ved hentning af fødevarer
    }
});

// Endpoint til at hente ingredienser for et bestemt måltid
// Endpoint til at hente ernæringsdata for en bestemt FoodID og SortKey
router.get('/nutritionalData/:foodID/:sortKey', async (req, res) => {
    const { foodID, sortKey } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FoodID', mssql.Int, foodID)
            .input('SortKey', mssql.Int, sortKey)
            .query('SELECT FoodID, SortKey, ResVal FROM dbo.FRIDA WHERE FoodID = @FoodID AND SortKey = @SortKey');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Sender det fundne resultat tilbage
        } else {
            res.status(404).send('Nutritional data not found'); // Sender en 404, hvis ingen data findes
        }
    } catch (error) {
        console.error("Error fetching nutritional data:", error);
        res.status(500).send("Error accessing the database");
    }
}); */ 