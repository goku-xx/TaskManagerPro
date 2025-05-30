const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// === Load environment variables ===
console.log('MONGO_URI before dotenv.config():', process.env.MONGO_URI);

const dotenvResult = dotenv.config({ override: true });
if (dotenvResult.error) {
  console.error('❌ Error loading .env file:', dotenvResult.error);
} else {
  console.log('✅ .env file loaded successfully.');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Parsed .env variables:', dotenvResult.parsed);
  }
}

// === Initialize Express app ===
const app = require('./app');
const server = http.createServer(app);

// === Setup Socket.IO ===
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    methods: ['GET', 'POST'],
  },
});
app.set('socketio', io);

// === Setup Socket Events ===
require('./socket/socketManager')(io);

// === Database Connection ===
const PORT = process.env.PORT || 5000;
console.log('MONGO_URI from server.js:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB Connection Failed in server.js:', err.message);
    process.exit(1); // Exit if critical
  });
