const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('[AuthMiddleware] Received Authorization Header:', authHeader); // Log the raw header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AuthMiddleware] No token or malformed header.');
    return res.status(401).json({ message: 'No token provided or token is malformed.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AuthMiddleware] Extracted Token:', token); // Log the extracted token
  // Log the JWT_SECRET being used for verification (ensure it's not a placeholder)
  console.log('[AuthMiddleware] JWT_SECRET for verification (first 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET');

  try {
    // Ensure JWT_SECRET is not a known placeholder before attempting verification
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'YOUR_ACTUAL_GENERATED_STRONG_AND_UNIQUE_SECRET_STRING_HERE' || process.env.JWT_SECRET === 'your_jwt_secret_key') {
        console.error('[AuthMiddleware] CRITICAL: JWT_SECRET is still a placeholder or not set during verification.');
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not properly set.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid.' });
  }
};
