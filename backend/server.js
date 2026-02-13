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

    // Handle New Appointment Booking (Real-time Alert)
    socket.on('new_appointment', (data) => {
        console.log('New Appointment Event:', data);
        if (data.professionalId) {
            // Notify the professional specifically
            io.to(data.professionalId).emit('notification', {
                type: 'APPOINTMENT_PENDING',
                title: 'New Booking Request',
                message: `New booking request from ${data.patientName || 'a patient'}`,
                appointment: data,
                timestamp: new Date().toISOString()
            });
            // Also refresh their dashboard data
            io.to(data.professionalId).emit('appointment_change', data);
        }
    });

    // Generic Notification Handler (for Vitals, Records, Alerts, etc.)
    socket.on('send_notification', (data) => {
        console.log('Notification Request:', data);
        const { recipientId, type, title, message, metadata } = data;
        if (recipientId) {
            io.to(recipientId).emit('notification', {
                type: type || 'GENERAL',
                title: title || 'New Update',
                message: message || 'You have a new update.',
                metadata: metadata || {},
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle Messages
    socket.on('send_message', (data) => {
        if (data.recipientId) {
            io.to(data.recipientId).emit('receive_message', data);

            // Also trigger a notification for the sound/alert UI
            io.to(data.recipientId).emit('notification', {
                type: 'CHAT',
                title: `New message from ${data.senderName || 'Staff'}`,
                message: data.content,
                timestamp: new Date().toISOString()
            });
        }
    });

    // --- WebRTC Signaling ---
    socket.on('call-user', (data) => {
        console.log(`Call from ${data.from} to room ${data.userToCall}`);
        socket.to(data.userToCall).emit('call-made', {
            signal: data.signalData,
            from: data.from,
            name: data.name
        });
    });

    socket.on('make-answer', (data) => {
        console.log(`Answer from ${socket.id} to ${data.to}`);
        socket.to(data.to).emit('answer-made', {
            signal: data.signal,
            answerId: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        // console.log(`ICE Candidate from ${socket.id} to ${data.to}`);
        socket.to(data.to).emit('ice-candidate-received', {
            candidate: data.candidate,
            from: socket.id
        });
    });

    socket.on('leave-call', (data) => {
        console.log(`User ${socket.id} left call to ${data.to}`);
        socket.to(data.to).emit('call-ended');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

httpServer.listen(port, () => {
    console.log(`> Backend Socket Server ready on port ${port}`);
});
