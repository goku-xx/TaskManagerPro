module.exports = (io) => {
  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('joinProjectRoom', (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined room ${projectId}`);
    });

    // Example: Listen for a message sent by a client to a specific project room
    socket.on('sendMessageToProjectRoom', (data) => {
      // Ensure data contains projectId and message
      const { projectId, message, senderName } = data;

      if (projectId && message) {
        // Broadcast the message to all clients in the specified project room, including the sender
        io.to(projectId).emit('newMessageInRoom', {
          message: message,
          senderId: socket.id, // For a real app, you'd ideally use an authenticated user ID
          senderName: senderName || 'Anonymous', // Client should provide senderName
          timestamp: new Date()
        });
        console.log(`Message from ${socket.id} (as ${senderName || 'Anonymous'}) in room ${projectId}: ${message}`);
      } else {
        console.log(`Invalid message data received from ${socket.id}:`, data);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
