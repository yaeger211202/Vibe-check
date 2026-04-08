import dotenv from 'dotenv';
import express from 'express';
import bcrypt from "bcrypt";
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


app.post("/api/signup", async (req, res) => {
    const { username, email, password } = req.body;

    const trimmedUsername = username?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!trimmedUsername || !normalizedEmail || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
        return res.status(400).json({ error: "Username must contain only letters and numbers." });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    try {
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE username = $1 OR email = $2",
            [trimmedUsername, normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Username or email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)`,
            [trimmedUsername, normalizedEmail, passwordHash]
        );

        return res.status(201).json({ message: "Account created successfully." });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});