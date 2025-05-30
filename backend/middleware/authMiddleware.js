// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('[AuthMiddleware] Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[AuthMiddleware] Missing or malformed token.');
      return res.status(401).json({ message: 'Authentication token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[AuthMiddleware] Extracted Token:', token.slice(0, 10) + '...');

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret === 'your_jwt_secret_key' || jwtSecret.includes('placeholder')) {
      console.error('[AuthMiddleware] ❗ JWT_SECRET is not properly configured.');
      return res.status(500).json({ message: 'Internal server error: invalid server configuration.' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    console.log('[AuthMiddleware] Decoded Token:', decoded);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn('[AuthMiddleware] User not found for token.');
      return res.status(401).json({ message: 'User not found. Unauthorized.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
