"use client";

import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
    if (!socket) {
        // If we're on the client, connect
        if (typeof window !== 'undefined') {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

            try {
                socket = io(socketUrl, {
                    transports: ['websocket'],
                    upgrade: false,
                    reconnection: true,
                    reconnectionAttempts: 3,
                    timeout: 5000
                });

                socket.on('connect_error', (error) => {
                    console.warn('Socket connection failed (real-time features disabled):', error.message);
                });

                console.log("Socket initialized at", socketUrl);
            } catch (error) {
                console.warn('Socket.IO unavailable (real-time features disabled)');
                return null;
            }
        }
    }
    return socket;
};
