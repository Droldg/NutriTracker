const express = require('express'); // Her importeres Express frameworket til at oprette routere
const router = express.Router(); // Her oprettes der en router ved hjælp af Express
const mssql = require('mssql'); // Her importeres MSSQL biblioteket til at arbejde med SQL Server
const { poolPromise } = require('../database'); // Her importeres databaseforbindelsen fra en database.js fil
const cors = require('cors'); 


router.use(cors()); // Aktiverer CORS (Cross-Origin Resource Sharing) for alle ruter

// Endpoint til at hente alle måltider for en specifik bruger
router.get('/getAllMeals/:username', async (req, res) => {
    const { username } = req.params; // Henter brugernavnet fra URL-parameteren
    try {
        const pool = await poolPromise; // Venter på tilslutning til databasen
        const result = await pool.request()
            .input('Username', mssql.NVarChar, username) // Indsætter brugernavn som en parameter til SQL forespørgslen
            .query(`
                SELECT m.Username, m.MealName, m.TotalCalories, m.TotalProtein, m.TotalFat, m.TotalFibers, 
                       m.CreationDate, m.CaloriesPer100g, m.ProteinPer100g, m.FatPer100g, m.FibersPer100g,
                       COUNT(i.IngredientName) as IngredientsCount
                FROM dbo.brugerMåltider m
                JOIN dbo.brugerMåltidIngredienser i ON m.MealName = i.MealName AND m.Username = i.Username
                WHERE m.Username = @Username
                GROUP BY m.Username, m.MealName, m.TotalCalories, m.TotalProtein, m.TotalFat, m.TotalFibers,
                         m.CreationDate, m.CaloriesPer100g, m.ProteinPer100g, m.FatPer100g, m.FibersPer100g
            `);
            
        res.json(result.recordset); // Sender resultatet tilbage som JSON
    } catch (error) {
        console.error("Error fetching meals for user " + username + ":", error);
        res.status(500).send("Unable to fetch meals."); // Sender fejlmeddelelse hvis noget går galt
    }
});


// Endpoint til at slette et måltid og dets ingredienser
router.delete('/deleteMeal/:username/:mealName', async (req, res) => {
    const { username, mealName } = req.params; // Henter brugernavn og måltidsnavn fra URL-parameteren
    try {
        const pool = await poolPromise;
        const transaction = new mssql.Transaction(pool); // Starter en database-transaktion
        await transaction.begin(); // Starter en database-transaktion

        const deleteIngredients = new mssql.Request(transaction); // Opretter en forespørgsel til at slette ingredienser
        await deleteIngredients
            .input('Username', mssql.NVarChar, username)
            .input('MealName', mssql.NVarChar, mealName)
            .query('DELETE FROM dbo.brugerMåltidIngredienser WHERE Username = @Username AND MealName = @MealName');

        const deleteMeal = new mssql.Request(transaction); // Opretter en forespørgsel til at slette måltidet
        await deleteMeal
            .input('Username', mssql.NVarChar, username)
            .input('MealName', mssql.NVarChar, mealName)
            .query('DELETE FROM dbo.brugerMåltider WHERE Username = @Username AND MealName = @MealName');

        await transaction.commit(); // Bekræfter transaktionen
        res.send("Meal and its ingredients deleted successfully.");
    } catch (error) {
        console.error("Error deleting meal:", error);
        await transaction.rollback(); // Annullerer transaktionen hvis der opstår fejl
        res.status(500).send("Failed to delete meal.");
    }
});


// Endpoint for at hente ingredienser for et specifikt måltid
router.get('/getMealIngredients/:mealName', async (req, res) => {
    const mealName = req.params.mealName; // Henter måltidsnavnet fra URL-parameteren
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MealName', mssql.NVarChar, mealName)
            .query('SELECT IngredientName, Grams FROM dbo.brugerMåltidIngredienser WHERE MealName = @MealName');

        if (result.recordset.length > 0) {
            res.json(result.recordset); // Sender ingredienserne som JSON hvis de findes
        } else {
            res.status(404).send('No ingredients found for this meal'); // Sender 404 hvis ingen ingredienser findes
        }
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).send("Error accessing the database"); // Her sendes en fejl ved databaseadgang
    }
});



// Routes til MealCreator2SQL.js

// Endpoint for sikker søgning efter fødevarer
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




// Endpoint for at hente ernæringsdata baseret på fødevare-ID og sort-nøgle
// Endpoint til at hente ingredienser for et bestemt måltid
router.get('/foodDetails/:foodID', async (req, res) => {
    const foodID = req.params.foodID; // Henter fødevare-ID fra URL-parameter
    try {
        const pool = await poolPromise;
        const query = `
            SELECT f.FoodName, d.SortKey, d.ResVal
            FROM dbo.FRIDA f
            JOIN dbo.FRIDA d ON f.FoodID = d.FoodID
            WHERE f.FoodID = @FoodID AND d.SortKey IN (1030, 1110, 1310, 1240)`;

        const result = await pool.request()
            .input('FoodID', mssql.Int, foodID)
            .query(query);

        const data = result.recordset.reduce((acc, item) => { // Reducerer data til et enkelt objekt
            switch (item.SortKey) {
                case 1030: acc.kcal = item.ResVal; break;
                case 1110: acc.protein = item.ResVal; break;
                case 1310: acc.fat = item.ResVal; break;
                case 1240: acc.fibers = item.ResVal; break;
            }
            return acc;
        }, {});

        res.json({ // Sender data tilbage som JSON
            foodID: foodID,
            foodName: result.recordset[0]?.FoodName,
            nutritionalInfo: data
        });
    } catch (error) {
        console.error("Error fetching food details:", error);
        res.status(500).send("Unable to fetch food details."); // Her vises en besked, når der er fejl ved hentning af ernæringsdata
    }
});


// Endpoint til at hente ernæringsdata for en bestemt FoodID og SortKey
router.get('/nutritionalData/:foodID/:sortKey', async (req, res) => {
    const { foodID, sortKey } = req.params; // Henter fødevare-ID og sort-nøgle fra URL-parametre
    try {
        const pool = await poolPromise; // Venter på tilslutning til databasen
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
});



// Endpoint til at gemme et måltid
router.post('/saveMeal', async (req, res) => {
    const { username, mealName, ingredients } = req.body; // Udpakker data fra forespørgselskroppen

    if (!username || !mealName || ingredients.length === 0) {
        return res.status(400).send("Missing meal information."); // Tjekker om nødvendig information mangler
    }

    const pool = await poolPromise; // Venter på tilslutning til databasen
    const transaction = new mssql.Transaction(pool); // Starter en ny transaktion

    try {
        await transaction.begin(); // Starter transaktionen

        // Tjekker om måltidsnavnet allerede findes for brugeren
        const existingMeal = await transaction.request()
            .input('Username', mssql.NVarChar, username)
            .input('MealName', mssql.NVarChar, mealName)
            .query('SELECT MealName FROM dbo.brugerMåltider WHERE Username = @Username AND MealName = @MealName');

        if (existingMeal.recordset.length > 0) {
            await transaction.rollback(); // Annullerer transaktionen hvis måltidsnavnet allerede findes
            return res.status(409).send("This name is already taken for a meal.");
        }

        // Beregner de samlede ernæringsværdier for måltidet baseret på ingredienserne
        const totalValues = ingredients.reduce((acc, ing) => { // Reducerer ingredienserne til en samlet værdi
            const gramsFactor = ing.grams / 100;
            acc.calories += parseFloat(ing.details.kcal) * gramsFactor;
            acc.protein += parseFloat(ing.details.protein) * gramsFactor;
            acc.fat += parseFloat(ing.details.fat) * gramsFactor;
            acc.fibers += parseFloat(ing.details.fibers) * gramsFactor;
            return acc;
        }, { calories: 0, protein: 0, fat: 0, fibers: 0 });

        // Beregner de samlede gram
        const totalGrams = ingredients.reduce((acc, ing) => {
            return acc + parseFloat(ing.grams);
        }, 0);

        // Beregner næringsstoffer per 100 gram
        const nutrientsPer100g = {
            calories: totalValues.calories / (totalGrams / 100),
            protein: totalValues.protein / (totalGrams / 100),
            fat: totalValues.fat / (totalGrams / 100),
            fibers: totalValues.fibers / (totalGrams / 100)
        };

        // Her Indsættes det nye måltid i databasen
        const mealInsert = new mssql.Request(transaction);
        await mealInsert.input('Username', mssql.NVarChar, username)
            .input('MealName', mssql.NVarChar, mealName)
            .input('TotalCalories', mssql.Float, totalValues.calories)
            .input('TotalProtein', mssql.Float, totalValues.protein)
            .input('TotalFat', mssql.Float, totalValues.fat)
            .input('TotalFibers', mssql.Float, totalValues.fibers)
            .input('CaloriesPer100g', mssql.Float, nutrientsPer100g.calories)
            .input('ProteinPer100g', mssql.Float, nutrientsPer100g.protein)
            .input('FatPer100g', mssql.Float, nutrientsPer100g.fat)
            .input('FibersPer100g', mssql.Float, nutrientsPer100g.fibers)
            .query(`
                INSERT INTO dbo.brugerMåltider 
                (Username, MealName, TotalCalories, TotalProtein, TotalFat, TotalFibers, CreationDate, 
                 CaloriesPer100g, ProteinPer100g, FatPer100g, FibersPer100g)
                VALUES 
                (@Username, @MealName, @TotalCalories, @TotalProtein, @TotalFat, @TotalFibers, DATEADD(hour, 2, GETDATE()), 
                 @CaloriesPer100g, @ProteinPer100g, @FatPer100g, @FibersPer100g);
            `);

        // Her Indsættes hver ingrediens i databasen
        for (const ingredient of ingredients) { // Løber igennem hver ingrediens
            const ingredientInsert = new mssql.Request(transaction); // Opretter en forespørgsel til at indsætte ingredienser
            await ingredientInsert.input('Username', mssql.NVarChar, username) // Indsætter brugernavn som parameter
                .input('MealName', mssql.NVarChar, mealName)
                .input('IngredientName', mssql.NVarChar, ingredient.foodName)
                .input('Grams', mssql.Float, parseFloat(ingredient.grams))
                .query(`
                    INSERT INTO dbo.brugerMåltidIngredienser 
                    (Username, MealName, IngredientName, Grams)
                    VALUES 
                    (@Username, @MealName, @IngredientName, @Grams);
                `);
        }

        await transaction.commit(); // Bekræfter og afslutter transaktionen
        res.send("Meal and ingredients saved successfully."); // Sender succesmeddelelse tilbage til klienten
    } catch (error) {
        console.error("Error saving meal:", error);
        await transaction.rollback(); // Annullerer transaktionen ved fejl
        res.status(500).send("Failed to save meal. Error: " + error.message); // Sender fejlmeddelelse
    }
});

module.exports = router; // Eksporterer routeren til brug i andre dele af applikationen

