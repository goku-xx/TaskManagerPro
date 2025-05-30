const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

console.log('MONGO_URI before dotenv.config():', process.env.MONGO_URI); // Add this line
const dotenvResult = dotenv.config({ override: true }); // Store the result, and allow override
if (dotenvResult.error) {
  console.error('❌ Error loading .env file:', dotenvResult.error);
} else {
  console.log('✅ .env file loaded successfully.');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Parsed .env variables:', dotenvResult.parsed);
  }
}
const app = require('./app'); // Then require app, so it has access to process.env
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Be more specific in production, e.g., 'http://localhost:3001' or your frontend domain
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    methods: ['GET', 'POST']
  }
});
app.set('socketio', io); // Make io accessible in request handlers - MOVED HERE
require('./socket/socketManager')(io);

const PORT = process.env.PORT || 5000;

console.log('MONGO_URI from server.js:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ DB Connection Failed in server.js:', err.message);
  // Consider exiting if the database connection is critical for startup
  process.exit(1);
 });
