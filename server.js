const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

// Explicitly handle process errors to prevent silent failures
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    // process.exit(1); // Optional: Restart via PM2 or allow manual restart
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

// Parse CLI args for port
const args = process.argv.slice(2);
const portIndex = args.findIndex(arg => arg === '-p' || arg === '--port');
const cliPort = portIndex !== -1 ? args[portIndex + 1] : null;

const port = cliPort || process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true);
            const { pathname, query } = parsedUrl;

            if (pathname === '/a') {
                await app.render(req, res, '/a', query);
            } else if (pathname === '/b') {
                await app.render(req, res, '/b', query);
            } else {
                await handle(req, res, parsedUrl);
            }
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join a room based on User ID (for private notifications)
        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Handle Appointment Updates
        socket.on('appointment_update', (data) => {
            // Broadcast to relevant parties
            // e.g. .to(data.professionalId).emit(...)
            io.emit('appointment_change', data); // Broadcast to all for now or specific rooms
        });

        // Handle Messages
        socket.on('send_message', (data) => {
            // Broadcast to the patient's care team room
            if (data.patientId) {
                // Also broadcast to self for immediate feedback/sync if needed, 
                // though usually client handles optimistic UI. 
                // But for simplicity/correctness with other tabs open:
                io.to(data.patientId).emit('receive_message', data);
            }
        });

        // --- WebRTC Signaling ---
        socket.on('call-user', (data) => {
            // data: { userToCall, signalData, from, name }
            io.to(data.userToCall).emit('call-made', {
                signal: data.signalData,
                from: data.from,
                name: data.name
            });
        });

        socket.on('make-answer', (data) => {
            // data: { signal, to }
            io.to(data.to).emit('answer-made', {
                signal: data.signal,
                answerId: socket.id
            });
        });

        socket.on('ice-candidate', (data) => {
            // data: { candidate, to }
            io.to(data.to).emit('ice-candidate-received', {
                candidate: data.candidate,
                from: socket.id
            });
        });


        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
