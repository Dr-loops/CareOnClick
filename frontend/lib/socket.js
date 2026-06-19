"use client";

import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
    if (!socket) {
        // If we're on the client, connect
        if (typeof window !== 'undefined') {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
            socket = io(socketUrl, {
                transports: ['websocket'],
                upgrade: false
            });
            console.log("Socket initialized at", socketUrl || "current origin");
        }
    }
    return socket;
};
