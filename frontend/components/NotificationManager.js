"use client";
import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import Toast from './Toast';

export default function NotificationManager() {
    const { data: session } = useSession();
    const [toast, setToast] = useState(null);
    const [permission, setPermission] = useState('default');

    // Simple beep sound using Web Audio API to avoid external assets
    const playNotificationSound = useCallback(() => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
            oscillator.frequency.exponentialRampToValueAtTime(880.00, context.currentTime + 0.1); // A5 note

            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, []);

    const showBrowserNotification = useCallback((title, options) => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    icon: '/favicon.ico', // Adjust icon path if needed
                    ...options
                });
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }

        const socket = getSocket();
        if (socket && session?.user) {
            // Ensure we are in our private room
            socket.emit('join_room', session.user.id);

            socket.on('notification', (data) => {
                console.log("[Global Notification]", data);

                // 1. Play Sound
                playNotificationSound();

                // 2. Show Toast
                setToast({ message: data.title + ": " + data.message, type: 'info' });

                // 3. Show Browser Notification
                showBrowserNotification(data.title, {
                    body: data.message,
                    tag: data.type
                });
            });

            return () => {
                socket.off('notification');
            };
        }
    }, [session, playNotificationSound, showBrowserNotification]);

    const requestPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Permission Banner (visible only if not granted) */}
            {permission === 'default' && session?.user && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    background: 'var(--color-navy)',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '0.9rem'
                }}>
                    <span>🔔 Enable notifications for real-time alerts?</span>
                    <button
                        onClick={requestPermission}
                        style={{
                            background: 'var(--color-sea-blue)',
                            border: 'none',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Allow
                    </button>
                    <button
                        onClick={() => setPermission('denied')}
                        style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                    >
                        Later
                    </button>
                </div>
            )}
        </>
    );
}
