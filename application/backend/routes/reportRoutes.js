// reportRoutes.js
// Mount in server.js:  app.use("/api/reports", createReportRoutes(pool));

import express from "express";
import { requireAuth } from "../middleware/auth.js";

const VALID_TARGET_TYPES = ["note", "reply"];

const VALID_REASONS = [
    "spam",
    "harassment",
    "misinformation",
    "inappropriate_content",
    "off_topic",
    "other",
];

export function createReportRoutes(pool) {
    const router = express.Router();

    async function getTargetOwnerId(targetType, targetId) {
        if (targetType === "note") {
            const { rows } = await pool.query(
                "SELECT user_id FROM notes WHERE note_id = $1",
                [targetId]
            );
            return rows[0]?.user_id ?? null;
        }
        if (targetType === "reply") {
            const { rows } = await pool.query(
                "SELECT user_id FROM replies WHERE reply_id = $1",
                [targetId]
            );
            return rows[0]?.user_id ?? null;
        }
        return null;
    }

    // POST /api/reports
    // Body: { target_type, target_id, reason, details? }
    router.post("/", requireAuth, async (req, res) => {
        const reporter_id = req.user.user_id;

        const { target_type, target_id, reason, details = "" } = req.body;

        if (!VALID_TARGET_TYPES.includes(target_type)) {
            return res.status(400).json({
                error: `Invalid target_type. Must be one of: ${VALID_TARGET_TYPES.join(", ")}.`,
            });
        }

        const parsedTargetId = Number.parseInt(target_id, 10);
        if (!parsedTargetId || parsedTargetId <= 0) {
            return res.status(400).json({ error: "target_id must be a positive integer." });
        }

        if (!VALID_REASONS.includes(reason)) {
            return res.status(400).json({
                error: `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}.`,
            });
        }

        if (typeof details !== "string" || details.length > 1000) {
            return res.status(400).json({ error: "Details must be a string of 1000 characters or fewer." });
        }

        try {
            const ownerId = await getTargetOwnerId(target_type, parsedTargetId);

            if (ownerId === null) {
                return res.status(404).json({ error: "Reported content not found." });
            }

            if (ownerId === reporter_id) {
                return res.status(400).json({ error: "You cannot report your own content." });
            }
        } catch (err) {
            console.error("Report target lookup error:", err);
            return res.status(500).json({ error: "Failed to verify reported content." });
        }

        try {
            const { rows } = await pool.query(
                `INSERT INTO reports
                     (reporter_id, target_type, target_id, reason, details)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (reporter_id, target_type, target_id) DO UPDATE SET
                     reason     = EXCLUDED.reason,
                     details    = EXCLUDED.details,
                     updated_at = NOW()
                 RETURNING report_id, target_type, target_id, reason, status, created_at`,
                [reporter_id, target_type, parsedTargetId, reason, details.trim()]
            );

            return res.status(201).json({ report: rows[0] });
        } catch (err) {
            console.error("Report insert error:", err);
            return res.status(500).json({ error: "Failed to submit report." });
        }
    });

    return router;
}