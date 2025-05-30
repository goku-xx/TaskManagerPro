const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // Mongoose connection will be handled in server.js

console.log('MONGO_URI from app.js (should be set by server.js):', process.env.MONGO_URI);

const app = express();

app.use(cors());
app.use(express.json());

    const authMiddleware = require('./middleware/authMiddleware'); // Assuming you create this
    
// Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', authMiddleware, require('./routes/userRoutes'));
    app.use('/api/projects', authMiddleware, require('./routes/projectRoutes'));
    app.use('/api/tasks', authMiddleware, require('./routes/taskRoutes'));
    app.use('/api/comments', authMiddleware, require('./routes/commentRoutes'));
    app.use('/api/notifications', authMiddleware, require('./routes/notificationRoutes'));

module.exports = app; // Export the app