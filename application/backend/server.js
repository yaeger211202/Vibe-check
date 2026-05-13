import dotenv from 'dotenv';
import express from 'express';
import bcrypt from "bcrypt";
import crypto from 'crypto';
import pkg from 'pg';

import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import { sendVerificationEmail } from './utils/email_verification.js';

import swaggerUi from "swagger-ui-express";
import { createNotesRoutes } from './routes/notesRoutes.js';
import { createReactionsRoutes } from './routes/reactionsRoutes.js';
import { createRepliesRoutes } from './routes/repliesRoutes.js';
import { createLocationsRoutes } from './routes/locationsRoutes.js';
import swaggerSpec from "./docs/openapi.js";

const { Pool } = pkg;
const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

function mapScoreToVibeLevel(score) {
    if (score === null || score === undefined) return null;

    const numericScore = Number.parseFloat(score);

    if (Number.isNaN(numericScore)) return null;
    if (numericScore < 1.5) return "dead";
    if (numericScore < 2.5) return "quiet";
    if (numericScore < 3.5) return "moderate";
    if (numericScore < 4.5) return "busy";
    return "buzzing";
}

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function calculateDistanceKm(fromLat, fromLon, toLat, toLon) {
    const earthRadiusKm = 6371;
    const latDelta = toRadians(toLat - fromLat);
    const lonDelta = toRadians(toLon - fromLon);
    const startLat = toRadians(fromLat);
    const endLat = toRadians(toLat);

    const a = Math.sin(latDelta / 2) ** 2
        + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

function normalizeCategory(value) {
    return value?.trim().toLowerCase() || "";
}

const categoryMatchers = {
    Restaurant: ["restaurant", "fast_food", "food", "eatery"],
    Libraries: ["library", "books", "study"],
    Bar: ["bar", "pub", "biergarten"],
    Cafe: ["cafe", "coffee", "tea"],
    Park: ["park", "garden", "playground", "nature_reserve"],
    Museum: ["museum", "gallery", "exhibition"],
    Shopping: ["shop", "mall", "supermarket", "retail", "store", "marketplace"],
    Entertainment: ["cinema", "theatre", "theater", "arts_centre", "stadium", "bowling", "arcade"],
    Nightlife: ["nightclub", "bar", "pub", "biergarten"],
};

function deriveLocationCategories(place) {
    const normalizedClass = normalizeCategory(place.class || place.category);
    const normalizedType = normalizeCategory(place.type);
    const normalizedName = normalizeCategory(place.display_name || place.name);

    const matches = Object.entries(categoryMatchers)
        .filter(([, matchTerms]) =>
            matchTerms.some((term) =>
                normalizedClass.includes(term)
                || normalizedType.includes(term)
                || normalizedName.includes(term)
            )
        )
        .map(([categoryName]) => categoryName);

    return matches.length > 0 ? matches : ["na"];
}

function matchesCategoryFilter(place, requestedCategory) {
    if (!requestedCategory) return true;

    const matchTerms = Object.entries(categoryMatchers).find(
        ([categoryName]) => normalizeCategory(categoryName) === requestedCategory
    )?.[1];

    const normalizedClass = normalizeCategory(place.class || place.category);
    const normalizedType = normalizeCategory(place.type);
    const normalizedName = normalizeCategory(place.display_name || place.name);

    if (!matchTerms) return true;

    return matchTerms.some((term) =>
        normalizedClass.includes(term)
        || normalizedType.includes(term)
        || normalizedName.includes(term)
    );
}

app.get("/api/search/locations", async (req, res) => {
    const query = req.query.q?.trim();
    const requestedVibeLevel = req.query.vibeLevel?.trim().toLowerCase();
    const requestedCategory = normalizeCategory(req.query.category);
    const requestedRadiusKm = Number.parseFloat(req.query.radius);

    if (!query) {
        return res.status(400).json({ error: "Missing search query." });
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=25`,
            {
                headers: {
                    "User-Agent": "VibeCheck/0.1 (contact: rsrinath@sfsu.edu)"
                }
            }
        );

        if (!response.ok) {
            return res.status(502).json({ error: "Upstream geocoding failed." });
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return res.json([]);
        }

        const searchCenter = {
            lat: Number.parseFloat(data[0].lat),
            lon: Number.parseFloat(data[0].lon),
        };
        const nominatimIds = data
            .map((place) => Number.parseInt(place.place_id, 10))
            .filter((placeId) => !Number.isNaN(placeId));

        let savedLocationRows = [];

        if (nominatimIds.length > 0) {
            const savedLocationsResult = await pool.query(
                `SELECT
                    l.location_id,
                    l.nominatim_id,
                    l.name,
                    l.lat,
                    l.lng,
                    l.address,
                    l.category_tags,
                    l.radius_meters,
                    vs.avg_vibe_score
                 FROM locations l
                 LEFT JOIN location_vibe_scores vs ON vs.location_id = l.location_id
                 WHERE l.nominatim_id = ANY($1::bigint[])`,
                [nominatimIds]
            );

            savedLocationRows = savedLocationsResult.rows;
        }

        const savedLocationsByNominatimId = new Map(
            savedLocationRows.map((row) => [
                String(row.nominatim_id),
                {
                    dbId: row.location_id,
                    vibeLevel: mapScoreToVibeLevel(row.avg_vibe_score),
                    avgVibeScore: row.avg_vibe_score === null ? null : Number.parseFloat(row.avg_vibe_score),
                },
            ])
        );

        const results = data
            .map((place) => {
                const savedLocation = savedLocationsByNominatimId.get(String(place.place_id));
                const lat = Number.parseFloat(place.lat);
                const lon = Number.parseFloat(place.lon);
                const distanceKm = calculateDistanceKm(searchCenter.lat, searchCenter.lon, lat, lon);
                const categoryTags = deriveLocationCategories(place);

                return {
                    id: place.place_id,
                    name: place.display_name,
                    lat,
                    lon,
                    type: place.type,
                    category: place.class,
                    categoryTags,
                    db_id: savedLocation?.dbId ?? null,
                    vibeLevel: savedLocation?.vibeLevel ?? null,
                    avgVibeScore: savedLocation?.avgVibeScore ?? null,
                    distance: distanceKm.toFixed(1),
                    distanceKm,
                };
            })
            .filter((place) => {
                const matchesVibe = !requestedVibeLevel
                    || requestedVibeLevel === "all"
                    || place.vibeLevel === requestedVibeLevel;
                const matchesCategory = matchesCategoryFilter(place, requestedCategory);
                const matchesRadius = Number.isNaN(requestedRadiusKm)
                    || requestedRadiusKm <= 0
                    || place.distanceKm <= requestedRadiusKm;

                return matchesVibe && matchesCategory && matchesRadius;
            })
            .map(({ distanceKm, ...place }) => place);

        return res.json(results);
    }
    catch (error) {
        console.error("Location search error:", error);
        return res.status(500).json({ error: "Server error during location search." });
    }
});


// grants full access after email verification
app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Missing verification token." });
    }

    try {
        const result = await pool.query(
            `SELECT user_id, email_verified, verification_sent_at
             FROM users
             WHERE verification_token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired verification token." });
        }

        const user = result.rows[0];

        if (user.email_verified) {
            return res.status(200).json({ message: "Email already verified. You can log in." });
        }

        // Token expires after 24 hours
        const sentAt = new Date(user.verification_sent_at);
        const now = new Date();
        const hoursDiff = (now - sentAt) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return res.status(400).json({
                error: "Verification link has expired. Please request a new one."
            });
        }

        await pool.query(
            `UPDATE users
             SET email_verified = TRUE, verified_at = NOW(), verification_token = NULL
             WHERE user_id = $1`,
            [user.user_id]
        );

        return res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const result = await pool.query(
            `SELECT user_id, username, email, password_hash, email_verified
             FROM users
             WHERE email = $1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, email_verified: user.email_verified },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // toggle to false when testing locally
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful.",
            user: { user_id: user.user_id, username: user.username, email: user.email, email_verified: user.email_verified }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// Signup
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

        // generate token and store it, then send verification email 
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await pool.query(
            `INSERT INTO users (username, email, password_hash, verification_token, verification_sent_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [trimmedUsername, normalizedEmail, passwordHash, verificationToken]
        );

        await sendVerificationEmail(normalizedEmail, verificationToken);

        return res.status(201).json({
            message: "Account created. Please check your email to verify your account."
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// Resend verification email
app.post("/api/resend-verification", async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const result = await pool.query(
            `SELECT user_id, email_verified, verification_sent_at
             FROM users WHERE email = $1`,
            [normalizedEmail]
        );

        // Don't reveal whether the email exists (security best practice)
        if (result.rows.length === 0) {
            return res.status(200).json({ message: "If that email exists, a new verification link has been sent." });
        }

        const user = result.rows[0];

        if (user.email_verified) {
            return res.status(400).json({ error: "This account is already verified." });
        }

        // Rate-limit: only allow resend every 5 minutes
        if (user.verification_sent_at) {
            const sentAt = new Date(user.verification_sent_at);
            const minutesSince = (new Date() - sentAt) / (1000 * 60);
            if (minutesSince < 5) {
                return res.status(429).json({
                    error: "Please wait a few minutes before requesting another verification email."
                });
            }
        }

        const newToken = crypto.randomBytes(32).toString('hex');

        await pool.query(
            `UPDATE users
             SET verification_token = $1, verification_sent_at = NOW()
             WHERE user_id = $2`,
            [newToken, user.user_id]
        );

        await sendVerificationEmail(normalizedEmail, newToken);

        return res.status(200).json({ message: "A new verification email has been sent." });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/logout", requireAuth, async (req, res) => {
    res.clearCookie('token', authCookieOptions);
    return res.status(200).json({ message: "Logged out successfully." });
});

app.get("/api/me", requireAuth, (req, res) => {
    return res.status(200).json({ user: req.user });
});


app.use("/api/notes", createNotesRoutes(pool));
app.use("/api/reactions", createReactionsRoutes(pool));
app.use("/api/replies", createRepliesRoutes(pool));
app.use("/api/locations", createLocationsRoutes(pool));

app.get("/api/locations/:location_id/vibe", async (req, res) => {
    const { location_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM location_vibe_scores WHERE location_id = $1`,
            [location_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Location not found." });
        }

        const data = result.rows[0];

        if (parseInt(data.total_notes) < 3) {
            return res.json({
                location_id: parseInt(location_id),
                avg_vibe_score: null,
                vibe_label: null,
                total_notes: parseInt(data.total_notes),
                message: "Not enough data to calculate vibe score."
            });
        }

        const score = parseFloat(data.avg_vibe_score);
        let vibe_label;
        if (score < 1.5) vibe_label = "Dead";
        else if (score < 2.5) vibe_label = "Quiet";
        else if (score < 3.5) vibe_label = "Moderate";
        else if (score < 4.5) vibe_label = "Busy";
        else vibe_label = "Buzzing";

        return res.json({
            location_id: parseInt(location_id),
            avg_vibe_score: score,
            vibe_label,
            total_notes: parseInt(data.total_notes)
        });

    } catch (error) {
        console.error("Vibe score error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});