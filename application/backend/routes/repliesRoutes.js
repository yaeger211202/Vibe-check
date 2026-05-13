import express from 'express';
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

export function createRepliesRoutes(pool) {
    router.get("/note/:note_id", async (req, res) => {
        const { note_id } = req.params;

        try {
            const noteCheck = await pool.query("SELECT note_id FROM notes WHERE note_id = $1", [note_id]);
            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            const result = await pool.query(
                `SELECT
                    rep.reply_id,
                    rep.note_id,
                    rep.user_id,
                    CASE WHEN rep.is_anonymous THEN 'Anonymous' ELSE u.username END AS username,
                    rep.content,
                    rep.is_anonymous,
                    rep.created_at
                 FROM replies rep
                 LEFT JOIN users u ON rep.user_id = u.user_id
                 WHERE rep.note_id = $1
                 ORDER BY rep.created_at ASC`,
                [note_id]
            );

            return res.json({
                note_id: parseInt(note_id, 10),
                total_replies: result.rows.length,
                replies: result.rows,
            });
        } catch (error) {
            console.error("Get replies error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    router.post("/", requireAuth, async (req, res) => {
        const { note_id, content, is_anonymous } = req.body;
        const user_id = req.user.user_id;

        if (!note_id || !content?.trim()) {
            return res.status(400).json({ error: "note_id and content are required." });
        }

        try {
            const noteCheck = await pool.query("SELECT note_id FROM notes WHERE note_id = $1", [note_id]);
            if (noteCheck.rows.length === 0) {
                return res.status(404).json({ error: "Note not found." });
            }

            const result = await pool.query(
                `INSERT INTO replies (note_id, user_id, content, is_anonymous)
                 VALUES ($1, $2, $3, $4)
                 RETURNING reply_id, note_id, user_id, content, is_anonymous, created_at`,
                [note_id, user_id, content.trim(), Boolean(is_anonymous)]
            );

            return res.status(201).json({
                message: "Reply added successfully.",
                reply: result.rows[0],
            });
        } catch (error) {
            console.error("Reply creation error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    router.delete("/:reply_id", requireAuth, async (req, res) => {
        const { reply_id } = req.params;
        const user_id = req.user.user_id;

        try {
            const replyCheck = await pool.query(
                "SELECT user_id FROM replies WHERE reply_id = $1",
                [reply_id]
            );

            if (replyCheck.rows.length === 0) {
                return res.status(404).json({ error: "Reply not found." });
            }

            if (replyCheck.rows[0].user_id !== parseInt(user_id, 10)) {
                return res.status(403).json({ error: "Unauthorized: You can only delete your own replies." });
            }

            await pool.query("DELETE FROM replies WHERE reply_id = $1", [reply_id]);

            return res.json({ message: "Reply deleted successfully." });
        } catch (error) {
            console.error("Reply deletion error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

export default router;
