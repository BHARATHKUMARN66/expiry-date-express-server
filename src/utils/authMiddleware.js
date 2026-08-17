const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123!';

const authMiddleware = (req, res, next) => {
    let token = null;

    // Check cookies first
    if (req.cookies && req.cookies.jwtToken) {
        token = req.cookies.jwtToken;
    }
    // Check Authorization header next
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded._id,
            name: decoded.name,
            email: decoded.email
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
