const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3001;

// 1. Create a lightweight HTTP server for health checks
const httpServer = createServer((req, res) => {
    // Health check endpoint for Railway/Uptime monitors
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', service: 'care-on-click-socket-server' }));
        return;
    }
    
    res.writeHead(404);
    res.end('Not found');
});

// 2. Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allows connections from Vercel domain
        methods: ["GET", "POST"]
    }
});

console.log('[Socket Server] Initializing on port ' + port + '...');

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Appointment Updates
    socket.on('appointment_update', (data) => {
        io.emit('appointment_change', data);
    });

    // New Appointment Alert
    socket.on('new_appointment', (data) => {
        console.log('New Appointment Event:', data);
        if (data.professionalId) {
            io.to(data.professionalId).emit('notification', {
                type: 'APPOINTMENT_PENDING',
                title: 'New Booking Request',
                message: `New booking request from ${data.patientName || 'a patient'}`,
                appointment: data,
                timestamp: new Date().toISOString()
            });
            io.to(data.professionalId).emit('appointment_change', data);
        }
    });

    // Generic Notifications
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

    // Messages
    socket.on('send_message', (data) => {
        if (data.recipientId) {
            io.to(data.recipientId).emit('receive_message', data);
            io.to(data.recipientId).emit('notification', {
                type: 'CHAT',
                title: `New message from ${data.senderName || 'Staff'}`,
                message: data.content,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Incoming Video Call Pop-ups
    socket.on('incoming_video_call', (data) => {
        if (data.recipientId) {
            console.log(`Routing incoming call to ${data.recipientId} from ${data.callerName}`);
            io.to(data.recipientId).emit('incoming_video_call', data);
        }
    });

    socket.on('decline_video_call', (data) => {
        if (data.callerId) {
            io.to(data.callerId).emit('cancel_video_call', data);
        }
    });

    // WebRTC Signaling
    socket.on('call-invite', (data) => {
        const { to, from, name, roomId } = data;
        socket.to(to).emit('incoming-call', { from, name, roomId });
    });

    socket.on('join-video-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { userId: socket.id });
    });

    socket.on('webrtc-offer', (data) => {
        socket.to(data.to).emit('webrtc-offer', { offer: data.offer, from: socket.id });
    });

    socket.on('webrtc-answer', (data) => {
        socket.to(data.to).emit('webrtc-answer', { answer: data.answer, from: socket.id });
    });

    socket.on('webrtc-ice-candidate', (data) => {
        socket.to(data.to).emit('webrtc-ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    socket.on('leave-call', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('user-left', { userId: socket.id });
        socket.leave(roomId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

httpServer.listen(port, () => {
    console.log(`> Standalone Socket.io server ready on port ${port}`);
});
