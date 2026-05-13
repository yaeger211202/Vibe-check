import express from 'express';
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function distanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Middleware to pass pool to routes
export function createNotesRoutes(pool, checkAndNotifyTrendingLocation) {
    // CREATE - Add a new note to a location
    router.post("/", requireAuth, async (req, res) => {
        const {
            location_id,
            content,
            vibe_level,
            is_anonymous,
            user_lat,
            user_lon
        } = req.body;
        const user_id = req.user.user_id;

        // Validation
        if (!location_id || !content || !vibe_level) {
            return res.status(400).json({ error: "Missing required fields: location_id, content, vibe_level" });
        }

        if (!["dead", "quiet", "moderate", "busy", "buzzing"].includes(vibe_level)) {
            return res.status(400).json({ error: "Invalid vibe_level. Must be: dead, quiet, moderate, busy, or buzzing" });
        }

        if (content.trim().length > 280) {
            return res.status(400).json({ error: "Note content must be 280 characters or less." });
        }

        try {
            // Check if user exists
            const userCheck = await pool.query("SELECT user_id FROM users WHERE user_id = $1", [user_id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            const locationResult = await pool.query(
                `SELECT location_id, lat, lng, radius_meters FROM locations WHERE location_id = $1`, [location_id]
            );

            if (locationResult.rows.length === 0) {
                return res.status(404).json({ error: "Location not found." });
            }

            const location = locationResult.rows[0];

            if (user_lat == null || user_lon == null) {
                return res.status(400).json({
                    error: "User location is required."
                });
            }

            const distance = distanceMeters(
                Number(user_lat),
                Number(user_lon),
                Number(location.lat),
                Number(location.lng)
            );

            const postRadiusMeters = Number(location.radius_meters || 1609);

            if (distance > postRadiusMeters) {
                const postRadiusMiles = (postRadiusMeters / 1609.34).toFixed(1);

                return res.status(403).json({
                    error: `You are too far away to post here. Move within ${postRadiusMiles} mile${postRadiusMiles === "1.0" ? "" : "s"} of this location and try again.`,
                    distance: Math.round(distance),
                    radius: postRadiusMeters
                });
            }

            // Insert the note
            const result = await pool.query(
                `INSERT INTO notes (user_id, location_id, content, vibe_level, is_anonymous, expires_at)
                 VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '24 hours')
                 RETURNING note_id, user_id, location_id, content, vibe_level, is_anonymous, created_at, expires_at`,
                [user_id, location_id, content.trim(), vibe_level, is_anonymous || false]
            );

            await checkAndNotifyTrendingLocation(location_id);

            return res.status(201).json({
                message: "Note created successfully.",
                note: result.rows[0]
            });
        }
        catch (error) {
            console.error("Note creation error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // READ - Get all notes for a specific location
    router.get("/location/:location_id", async (req, res) => {
        const { location_id } = req.params;

        try {
            // Check if location exists
            const locationCheck = await pool.query("SELECT location_id FROM locations WHERE location_id = $1", [location_id]);
            if (locationCheck.rows.length === 0) {
                return res.status(404).json({ error: "Location not found." });
            }

            // Get all non-expired notes for the location
            const result = await pool.query(
                `SELECT 
                    n.note_id, 
                    n.user_id, 
                    CASE WHEN n.is_anonymous THEN 'Anonymous' ELSE u.username END as username,
                    n.location_id, 
                    n.content, 
                    n.vibe_level, 
                    n.is_anonymous,
                    n.created_at,
                    n.expires_at,
                    COUNT(DISTINCT r.reaction_id) as reaction_count,
                    COUNT(DISTINCT rep.reply_id) as reply_count
                 FROM notes n
                 LEFT JOIN users u ON n.user_id = u.user_id
                 LEFT JOIN reactions r ON n.note_id = r.note_id
                 LEFT JOIN replies rep ON n.note_id = rep.note_id
                 WHERE n.location_id = $1 
                    AND (n.expires_at IS NULL OR n.expires_at > NOW())
                 GROUP BY n.note_id, u.username
                 ORDER BY n.created_at DESC`,
                [location_id]
            );

            return res.json({
                location_id: parseInt(location_id),
                total_notes: result.rows.length,
                notes: result.rows
            });
        }
        catch (error) {
            console.error("Get notes error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // READ - Get a specific note by note_id
    router.get("/:note_id", async (req, res) => {
        const { note_id } = req.params;

        try {
            const result = await pool.query(
                `SELECT 
                    n.note_id, 
                    n.user_id, 
                    CASE WHEN n.is_anonymous THEN 'Anonymous' ELSE u.username END as username,
                    n.location_id, 
                    n.content, 
                    n.vibe_level, 
                    n.is_anonymous,
                    n.created_at,
                    n.expires_at,
                    COUNT(DISTINCT r.reaction_id) as reaction_count,
                    COUNT(DISTINCT rep.reply_id) as reply_count
                 FROM notes n
                 LEFT JOIN users u ON n.user_id = u.user_id
                 LEFT JOIN reactions r ON n.note_id = r.note_id
                 LEFT JOIN replies rep ON n.note_id = rep.note_id
                 WHERE n.note_id = $1
                    AND (n.expires_at IS NULL OR n.expires_at > NOW())
                 GROUP BY n.note_id, u.username`,
                [note_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Note not found or expired." });
            }

            return res.json(result.rows[0]);
        }
        catch (error) {
            console.error("Get note error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // READ - Get all notes by a specific user
    router.get("/user/:user_id", async (req, res) => {
        const { user_id } = req.params;

        try {
            // Check if user exists
            const userCheck = await pool.query("SELECT user_id FROM users WHERE user_id = $1", [user_id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            const result = await pool.query(
                `SELECT 
                    n.note_id, 
                    n.user_id, 
                    n.location_id, 
                    l.name as location_name,
                    n.content, 
                    n.vibe_level,
                    n.is_anonymous,
                    n.created_at,
                    n.expires_at,
                    COUNT(DISTINCT r.reaction_id) as reaction_count,
                    COUNT(DISTINCT rep.reply_id) as reply_count
                 FROM notes n
                 LEFT JOIN locations l ON n.location_id = l.location_id
                 LEFT JOIN reactions r ON n.note_id = r.note_id
                 LEFT JOIN replies rep ON n.note_id = rep.note_id
                 WHERE n.user_id = $1
                 GROUP BY n.note_id, l.name
                 ORDER BY n.created_at DESC`,
                [user_id]
            );

            return res.json({
                user_id: parseInt(user_id),
                total_notes: result.rows.length,
                notes: result.rows
            });
        }
        catch (error) {
            console.error("Get user notes error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // UPDATE - Edit an existing note
    router.put("/:note_id", requireAuth, async (req, res) => {
        const { note_id } = req.params;
        const { content, vibe_level } = req.body;
        const user_id = req.user.user_id;

        if (!content && !vibe_level) {
            return res.status(400).json({ error: "At least one of (content, vibe_level) is required." });
        }

        if (vibe_level && !["dead", "quiet", "moderate", "busy", "buzzing"].includes(vibe_level)) {
            return res.status(400).json({ error: "Invalid vibe_level." });
        }

        if (content && content.trim().length > 280) {
            return res.status(400).json({ error: "Note content must be 280 characters or less." });
        }

        try {
            // Check if note exists and belongs to the user
            const noteCheck = await pool.query(
                `SELECT user_id FROM notes WHERE note_id = $1`,
                [note_id]
            );

            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            if (noteCheck.rows[0].user_id !== parseInt(user_id)) {
                return res.status(403).json({ error: "Unauthorized: You can only edit your own notes." });
            }

            // Update the note
            let updateQuery = "UPDATE notes SET ";
            const params = [];
            let paramCount = 1;

            if (content) {
                updateQuery += `content = $${paramCount}`;
                params.push(content.trim());
                paramCount++;
            }

            if (vibe_level) {
                if (content) updateQuery += ", ";
                updateQuery += `vibe_level = $${paramCount}`;
                params.push(vibe_level);
                paramCount++;
            }

            updateQuery += ` WHERE note_id = $${paramCount} RETURNING *`;
            params.push(note_id);

            const result = await pool.query(updateQuery, params);

            return res.json({
                message: "Note updated successfully.",
                note: result.rows[0]
            });
        }
        catch (error) {
            console.error("Note update error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // DELETE - Remove a note
    router.delete("/:note_id", requireAuth, async (req, res) => {
        const { note_id } = req.params;
        const user_id = req.user.user_id;

        try {
            // Check if note exists and belongs to the user
            const noteCheck = await pool.query(
                "SELECT user_id FROM notes WHERE note_id = $1",
                [note_id]
            );

            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            if (noteCheck.rows[0].user_id !== parseInt(user_id)) {
                return res.status(403).json({ error: "Unauthorized: You can only delete your own notes." });
            }

            // Delete the note (cascade will handle replies and reactions)
            await pool.query("DELETE FROM notes WHERE note_id = $1", [note_id]);

            return res.json({ message: "Note deleted successfully." });
        }
        catch (error) {
            console.error("Note deletion error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

export default router;