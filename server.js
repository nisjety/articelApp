const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Import the app module

const PORT = process.env.PORT || 3000;

// WebSocket setup
const server = http.createServer(app); // Pass the app module to the http.createServer function
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log('A user joined room:', room);
    });

    socket.on('leave', (room) => {
        socket.leave(room);
        console.log('A user left room:', room);
    });

    socket.on('message', (data) => {
        console.log('Received message from client:', data);
        socket.to(data.room).emit('message', data.message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Starter serveren
server.listen(PORT, () => { // Use the server.listen function instead of the app.listen function
    console.log(`Server started on port ${PORT}`);
});

// Handle any errors that may occur while starting the server
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Export the server and io modules
module.exports = { server, io };
