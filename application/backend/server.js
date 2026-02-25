import dotenv from 'dotenv';
import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/api/database_status', async (req, res) => {
    try {
        const result = await pool.query('SELECT postgis_version();');
        res.json({
            status: 'OK',
            postgis: result.rows[0].postgis_version
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});