// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
    this.verifyToken(req, res, () => {
        // Assuming the user object has a role field
        if (!req.user || req.user.role !== 'photographer') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    });
};

export { verifyToken, requireAdmin };