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

    // CREATE - Add a reaction to a note
    router.post("/", requireAuth, async (req, res) => {
        const { note_id } = req.body;
        const user_id = req.user.user_id;

        if (!note_id) {
            return res.status(400).json({ error: "note_id is required." });
        }

        try {
            // Check if note exists
            const noteCheck = await pool.query("SELECT note_id FROM notes WHERE note_id = $1", [note_id]);
            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            // Try to insert reaction (unique constraint will prevent duplicates)
            const result = await pool.query(
                `INSERT INTO reactions (user_id, note_id)
                 VALUES ($1, $2)
                 ON CONFLICT (user_id, note_id) DO NOTHING
                 RETURNING reaction_id, user_id, note_id, created_at`,
                [user_id, note_id]
            );

            if (result.rows.length === 0) {
                return res.status(200).json({ message: "Reaction already exists." });
            }

            return res.status(201).json({
                message: "Reaction added successfully.",
                reaction: result.rows[0]
            });
        }
        catch (error) {
            console.error("Reaction creation error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // DELETE - Remove a reaction
    router.delete("/:reaction_id", requireAuth, async (req, res) => {
        const { reaction_id } = req.params;
        const user_id = req.user.user_id;

        try {
            // Check if reaction exists and belongs to the user
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
        }
        catch (error) {
            console.error("Reaction deletion error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

export default router;
