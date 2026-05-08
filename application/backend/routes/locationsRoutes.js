import express from 'express';

const router = express.Router();

export function createLocationsRoutes(pool) {

    // Upsert
    router.post("/upsert", async (req, res) => {
        const { nominatim_id, name, lat, lng } = req.body;

        if (!nominatim_id || !name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: "nominatim_id, name, lat, and lng are required." });
        }

        try {
            const result = await pool.query(
                `INSERT INTO locations (nominatim_id, name, lat, lng)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (nominatim_id) DO UPDATE SET name = EXCLUDED.name
                RETURNING location_id, nominatim_id, name, lat, lng`,
                [nominatim_id, name, lat, lng]
            );

            return res.status(200).json({
                location: result.rows[0]
            });
        } catch (error) {
            console.error("Upsert error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // CREATE - Add a new location
    router.post("/", async (req, res) => {
        const { name, address, lat, lng, category_tags, radius_meters } = req.body;

        if (!name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: "name, lat, and lng are required." });
        }

        if (lat < -90 || lat > 90) {
            return res.status(400).json({ error: "Latitude must be between -90 and 90." });
        }

        if (lng < -180 || lng > 180) {
            return res.status(400).json({ error: "Longitude must be between -180 and 180." });
        }

        try {
            const result = await pool.query(
                `INSERT INTO locations (name, address, lat, lng, category_tags, radius_meters)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING location_id, name, address, lat, lng, category_tags, radius_meters`,
                [
                    name.trim(),
                    address ? address.trim() : null,
                    lat,
                    lng,
                    category_tags ? category_tags : null,
                    radius_meters || 100.0
                ]
            );

            const location_id = result.rows[0].location_id;

            await pool.query(
                `UPDATE locations SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE location_id = $3`,
                [lng, lat, location_id]
            );


            return res.status(201).json({
                message: "Location created successfully.",
                location: result.rows[0]
            });
        }
        catch (error) {
            console.error("Location creation error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // READ - Get location details
    router.get("/:location_id", async (req, res) => {
        const { location_id } = req.params;

        try {
            const result = await pool.query(
                `SELECT 
                    l.location_id,
                    l.name,
                    l.address,
                    l.lat,
                    l.lng,
                    l.category_tags,
                    l.radius_meters,
                    COUNT(DISTINCT n.note_id) as total_notes,
                    ROUND(AVG(CASE n.vibe_level
                        WHEN 'dead'     THEN 1
                        WHEN 'quiet'    THEN 2
                        WHEN 'moderate' THEN 3
                        WHEN 'busy'     THEN 4
                        WHEN 'buzzing'  THEN 5
                    END)::NUMERIC, 2) AS avg_vibe_score
                 FROM locations l
                 LEFT JOIN notes n ON l.location_id = n.location_id
                    AND (n.expires_at IS NULL OR n.expires_at > NOW())
                 WHERE l.location_id = $1
                 GROUP BY l.location_id`,
                [location_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Location not found." });
            }

            return res.json(result.rows[0]);
        }
        catch (error) {
            console.error("Get location error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // UPDATE - Update location details
    router.put("/:location_id", async (req, res) => {
        const { location_id } = req.params;
        const { name, address, category_tags, radius_meters } = req.body;

        if (!name && !address && !category_tags && !radius_meters) {
            return res.status(400).json({ error: "At least one field must be provided for update." });
        }

        try {
            const existingLocation = await pool.query(
                "SELECT * FROM locations WHERE location_id = $1",
                [location_id]
            );

            if (existingLocation.rows.length === 0) {
                return res.status(404).json({ error: "Location not found." });
            }

            const loc = existingLocation.rows[0];
            const updatedName = name || loc.name;
            const updatedAddress = address !== undefined ? address : loc.address;
            const updatedTags = category_tags || loc.category_tags;
            const updatedRadius = radius_meters || loc.radius_meters;

            const result = await pool.query(
                `UPDATE locations 
                 SET name = $1, address = $2, category_tags = $3, radius_meters = $4
                 WHERE location_id = $5
                 RETURNING location_id, name, address, lat, lng, category_tags, radius_meters`,
                [updatedName, updatedAddress, updatedTags, updatedRadius, location_id]
            );

            return res.json({
                message: "Location updated successfully.",
                location: result.rows[0]
            });
        }
        catch (error) {
            console.error("Location update error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    // DELETE - Delete a location
    router.delete("/:location_id", async (req, res) => {
        const { location_id } = req.params;

        try {
            const locationCheck = await pool.query(
                "SELECT location_id FROM locations WHERE location_id = $1",
                [location_id]
            );

            if (locationCheck.rows.length === 0) {
                return res.status(404).json({ error: "Location not found." });
            }

            await pool.query("DELETE FROM locations WHERE location_id = $1", [location_id]);

            return res.json({ message: "Location deleted successfully." });
        }
        catch (error) {
            console.error("Location deletion error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

export default router;

