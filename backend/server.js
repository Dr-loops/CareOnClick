const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io on the same HTTP server
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    console.log('[Unified Server] Initializing Socket.io...');

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
            console.log('Client disconnected');
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('Error during app.prepare():', err);
});
