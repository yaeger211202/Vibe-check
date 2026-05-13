import express from 'express';
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

export function createReactionsRoutes(pool) {
    // READ - Get reactions for a note
    router.get("/note/:note_id", async (req, res) => {
        const { note_id } = req.params;

        try {
            const noteCheck = await pool.query("SELECT note_id FROM notes WHERE note_id = $1", [note_id]);
            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            const result = await pool.query(
                `SELECT
                    r.reaction_id,
                    r.user_id,
                    u.username,
                    r.note_id,
                    r.reaction_type,
                    r.created_at
                 FROM reactions r
                 LEFT JOIN users u ON r.user_id = u.user_id
                 WHERE r.note_id = $1
                 ORDER BY r.created_at ASC`,
                [note_id]
            );

            return res.json({
                note_id: parseInt(note_id, 10),
                total_reactions: result.rows.length,
                reactions: result.rows,
            });
        } catch (error) {
            console.error("Get reactions error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // READ - Get all notes a user has reacted to 
    router.get("/user/:user_id", requireAuth, async (req, res) => {
        const { user_id } = req.params;

        // Only allow a user to view their own reaction history
        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: "Unauthorized." });
        }

        try {
            const userCheck = await pool.query("SELECT user_id FROM users WHERE user_id = $1", [user_id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            const result = await pool.query(
                `SELECT
                    r.reaction_id,
                    r.reaction_type,
                    r.created_at         AS reacted_at,
                    n.note_id,
                    n.content,
                    n.vibe_level,
                    n.is_anonymous,
                    n.created_at         AS note_created_at,
                    n.expires_at,
                    CASE WHEN n.is_anonymous THEN 'Anonymous'
                         ELSE author.username
                    END                  AS note_author,
                    l.location_id,
                    l.name               AS location_name,
                    COUNT(DISTINCT r2.reaction_id) AS reaction_count,
                    COUNT(DISTINCT rep.reply_id)   AS reply_count
                 FROM reactions r
                 JOIN notes n      ON r.note_id      = n.note_id
                 JOIN locations l  ON n.location_id  = l.location_id
                 LEFT JOIN users author ON n.user_id = author.user_id
                 LEFT JOIN reactions r2  ON n.note_id = r2.note_id
                 LEFT JOIN replies  rep  ON n.note_id = rep.note_id
                 WHERE r.user_id = $1
                   AND (n.expires_at IS NULL OR n.expires_at > NOW())
                 GROUP BY
                    r.reaction_id, r.reaction_type, r.created_at,
                    n.note_id, n.content, n.vibe_level, n.is_anonymous,
                    n.created_at, n.expires_at, author.username,
                    l.location_id, l.name
                 ORDER BY r.created_at DESC`,
                [user_id]
            );

            return res.json({
                user_id: parseInt(user_id),
                total_reactions: result.rows.length,
                reactions: result.rows,
            });
        } catch (error) {
            console.error("Get user reactions error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // CREATE - Add a reaction to a note
    router.post("/", requireAuth, async (req, res) => {
        const { note_id, reaction_type } = req.body;
        const user_id = req.user.user_id;
        const normalizedReactionType = typeof reaction_type === "string" ? reaction_type.trim().toLowerCase() : "";

        if (!note_id) {
            return res.status(400).json({ error: "note_id is required." });
        }

        if (!["thumbs_up", "thumbs_down"].includes(normalizedReactionType)) {
            return res.status(400).json({ error: "reaction_type must be thumbs_up or thumbs_down." });
        }

        try {
            const noteCheck = await pool.query("SELECT note_id FROM notes WHERE note_id = $1", [note_id]);
            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            const result = await pool.query(
                `INSERT INTO reactions (user_id, note_id, reaction_type)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, note_id)
                 DO UPDATE SET reaction_type = EXCLUDED.reaction_type, created_at = NOW()
                 RETURNING reaction_id, user_id, note_id, reaction_type, created_at`,
                [user_id, note_id, normalizedReactionType]
            );

            return res.status(201).json({
                message: "Reaction saved successfully.",
                reaction: result.rows[0]
            });
        } catch (error) {
            console.error("Reaction creation error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // DELETE - Remove a reaction
    router.delete("/:reaction_id", requireAuth, async (req, res) => {
        const { reaction_id } = req.params;
        const user_id = req.user.user_id;

        try {
            const reactionCheck = await pool.query(
                "SELECT user_id FROM reactions WHERE reaction_id = $1",
                [reaction_id]
            );

            if (reactionCheck.rows.length === 0) {
                return res.status(404).json({ error: "Reaction not found." });
            }

            if (reactionCheck.rows[0].user_id !== parseInt(user_id)) {
                return res.status(403).json({ error: "Unauthorized: You can only remove your own reactions." });
            }

            await pool.query("DELETE FROM reactions WHERE reaction_id = $1", [reaction_id]);

            return res.json({ message: "Reaction removed successfully." });
        } catch (error) {
            console.error("Reaction deletion error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

export default router;