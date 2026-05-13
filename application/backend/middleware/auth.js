import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

// Use this on any route that requires a verified email (notes, replies, reactions)
export function requireVerified(req, res, next) {
    if (!req.user?.email_verified) {
        return res.status(403).json({
            error: 'Email not verified. Please verify your email to perform this action.',
        });
    }
    next();
}