const jwt = require('jsonwebtoken');
exports.generateToken = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });