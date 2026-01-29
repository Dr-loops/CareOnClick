const { createServer } = require('http');
const { Server } = require('socket.io');

// Explicitly handle process errors to prevent silent failures
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const port = process.env.PORT || 3001;

const httpServer = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Dr. Kal Backend Socket Server is running\n');
});

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust for security in production
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room based on User ID (for private notifications)
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle Appointment Updates
    socket.on('appointment_update', (data) => {
        io.emit('appointment_change', data);
    });

    // Handle Messages
    socket.on('send_message', (data) => {
        if (data.patientId) {
            io.to(data.patientId).emit('receive_message', data);
        }
    });

    // --- WebRTC Signaling ---
    socket.on('call-user', (data) => {
        io.to(data.userToCall).emit('call-made', {
            signal: data.signalData,
            from: data.from,
            name: data.name
        });
    });

    socket.on('make-answer', (data) => {
        io.to(data.to).emit('answer-made', {
            signal: data.signal,
            answerId: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.to).emit('ice-candidate-received', {
            candidate: data.candidate,
            from: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

httpServer.listen(port, () => {
    console.log(`> Backend Socket Server ready on port ${port}`);
});
