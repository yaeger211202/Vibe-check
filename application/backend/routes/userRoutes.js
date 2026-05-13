import express from 'express';
import bcrypt from 'bcrypt';
import { requireAuth } from '../auth.js';

export function createUsersRoutes(pool) {
    const router = express.Router();

    // view own or another user's public profile
    router.get('/:user_id/profile', async (req, res) => {
        const { user_id } = req.params;

        try {
            const result = await pool.query(
                `SELECT
                    u.user_id,
                    u.username,
                    u.profile_picture_url,
                    u.created_at,
                    u.account_status,
                    u.email_verified,
                    up.visibility,
                    up.default_radius_km,
                    up.notifications_enabled,
                    (
                        SELECT COUNT(*)
                        FROM notes
                        WHERE user_id = u.user_id
                          AND (expires_at IS NULL OR expires_at > NOW())
                    ) AS total_notes_posted,
                    (
                        SELECT COUNT(*)
                        FROM reactions r
                        JOIN notes n ON r.note_id = n.note_id
                        WHERE n.user_id = u.user_id
                    ) AS total_reactions_received
                 FROM users u
                 LEFT JOIN user_profiles up ON u.user_id = up.user_id
                 WHERE u.user_id = $1
                   AND u.account_status != 'deleted'`,
                [user_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            return res.json(result.rows[0]);
        } catch (err) {
            console.error('Get profile error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });


    // edit username with availability check
    router.put('/:user_id/username', requireAuth, async (req, res) => {
        const { user_id } = req.params;
        const { username } = req.body;

        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }

        const trimmed = username?.trim();
        if (!trimmed) {
            return res.status(400).json({ error: 'Username is required.' });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores.' });
        }
        if (trimmed.length < 3 || trimmed.length > 50) {
            return res.status(400).json({ error: 'Username must be between 3 and 50 characters.' });
        }

        try {
            // availability check
            const existing = await pool.query(
                'SELECT user_id FROM users WHERE username = $1 AND user_id != $2',
                [trimmed, user_id]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'That username is already taken. Please choose another.' });
            }

            await pool.query(
                'UPDATE users SET username = $1 WHERE user_id = $2',
                [trimmed, user_id]
            );

            return res.json({ message: 'Username updated successfully.', username: trimmed });
        } catch (err) {
            console.error('Username update error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });


    // change password requires current password confirmation
    router.put('/:user_id/password', requireAuth, async (req, res) => {
        const { user_id } = req.params;
        const { current_password, new_password } = req.body;

        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }
        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Both current and new passwords are required.' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }
        if (current_password === new_password) {
            return res.status(400).json({ error: 'New password must differ from your current password.' });
        }

        try {
            const result = await pool.query(
                'SELECT password_hash FROM users WHERE user_id = $1',
                [user_id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const matches = await bcrypt.compare(current_password, result.rows[0].password_hash);
            if (!matches) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }

            const newHash = await bcrypt.hash(new_password, 10);
            await pool.query(
                'UPDATE users SET password_hash = $1 WHERE user_id = $2',
                [newHash, user_id]
            );

            return res.json({ message: 'Password updated successfully.' });
        } catch (err) {
            console.error('Password update error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // update profile picture
    router.put('/:user_id/picture', requireAuth, async (req, res) => {
        const { user_id } = req.params;
        const { profile_picture_url } = req.body;

        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }

        try {
            await pool.query(
                'UPDATE users SET profile_picture_url = $1 WHERE user_id = $2',
                [profile_picture_url || null, user_id]
            );
            return res.json({
                message: 'Profile picture updated.',
                profile_picture_url: profile_picture_url || null
            });
        } catch (err) {
            console.error('Picture update error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // profile visibility + notification preferences + default radius
    // Uses UPSERT so a missing user_profiles row is created automatically.
    router.put('/:user_id/settings', requireAuth, async (req, res) => {
        const { user_id } = req.params;
        const { visibility, notifications_enabled, default_radius_km } = req.body;

        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }
        if (visibility && !['public', 'friends_only'].includes(visibility)) {
            return res.status(400).json({ error: 'Visibility must be "public" or "friends_only".' });
        }
        if (default_radius_km !== undefined && (isNaN(default_radius_km) || default_radius_km <= 0)) {
            return res.status(400).json({ error: 'Default radius must be a positive number.' });
        }

        try {
            await pool.query(
                `INSERT INTO user_profiles (user_id, visibility, notifications_enabled, default_radius_km)
                 VALUES ($1, COALESCE($2, 'public'), COALESCE($3, TRUE), COALESCE($4, 5.0))
                 ON CONFLICT (user_id) DO UPDATE SET
                     visibility          = COALESCE($2, user_profiles.visibility),
                     notifications_enabled = COALESCE($3, user_profiles.notifications_enabled),
                     default_radius_km   = COALESCE($4, user_profiles.default_radius_km)`,
                [user_id, visibility ?? null, notifications_enabled ?? null, default_radius_km ?? null]
            );

            return res.json({ message: 'Settings updated successfully.' });
        } catch (err) {
            console.error('Settings update error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // delete account
    // intact for other users while the account is effectively gone.
    router.delete('/:user_id', requireAuth, async (req, res) => {
        const { user_id } = req.params;
        const { password } = req.body;

        if (parseInt(user_id) !== req.user.user_id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Password confirmation is required to delete your account.' });
        }

        try {
            const result = await pool.query(
                'SELECT password_hash FROM users WHERE user_id = $1',
                [user_id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const matches = await bcrypt.compare(password, result.rows[0].password_hash);
            if (!matches) {
                return res.status(401).json({ error: 'Incorrect password. Account not deleted.' });
            }

            await pool.query(
                `UPDATE users SET
                    account_status      = 'deleted',
                    email               = 'deleted_' || user_id || '@deleted.vibecheck',
                    username            = 'deleted_' || user_id,
                    profile_picture_url = NULL,
                    password_hash       = 'DELETED'
                 WHERE user_id = $1`,
                [user_id]
            );

            res.clearCookie('token');
            return res.json({ message: 'Account deleted successfully.' });
        } catch (err) {
            console.error('Account deletion error:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    return router;
}