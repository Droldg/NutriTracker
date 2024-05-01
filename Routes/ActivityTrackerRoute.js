const express = require('express');
const router = express.Router();
const mssql = require('mssql'); // Sørg for at mssql er importeret
const { pool, poolPromise } = require('../database'); // Antager at du har centraliseret din database logik

// Endpoint til at hente kategorier
router.get('/categories', async (req, res) => {
    try {
        await poolPromise; // Sikrer at forbindelsen er klar før database forespørgsler udføres
        const result = await pool.request().query('SELECT DISTINCT Kategori FROM dbo.aktivitetData');
        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error: Unable to fetch categories.");
    }
});

// Endpoint til at hente aktiviteter baseret på kategori
router.get('/activities/:category', async (req, res) => {
    let category;
    try {
        await poolPromise; // Sikrer at forbindelsen er klar før database forespørgsler udføres
        category = req.params.category;
        const result = await pool.request()
            .input('Kategori', mssql.NVarChar, category)
            .query('SELECT AktivitetsNavn, KcalPerTime FROM dbo.aktivitetData WHERE Kategori = @Kategori');
        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching activities for category:", category, error);
        res.status(500).send("Internal Server Error: Unable to fetch activities.");
    }
});

module.exports = router;
