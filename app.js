const express = require('express');
const db = require('./config/db'); 
const app = express();
const port = 3000;

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT "MySQL Succesfull!"');
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});