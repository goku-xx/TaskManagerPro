const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debugging
console.log('MONGO_URI from app.js (should be set by server.js):', process.env.MONGO_URI);

// Custom Auth Middleware
const authMiddleware = require('./middleware/authMiddleware');

// Public Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Protected Routes
app.use('/api/users', authMiddleware, require('./routes/userRoutes'));
app.use('/api/projects', authMiddleware, require('./routes/projectRoutes'));
app.use('/api/tasks', authMiddleware, require('./routes/taskRoutes'));
app.use('/api/comments', authMiddleware, require('./routes/commentRoutes'));
app.use('/api/notifications', authMiddleware, require('./routes/notificationRoutes'));

// Health check or base route (optional)
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

module.exports = app;
