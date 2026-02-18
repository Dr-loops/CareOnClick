"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import Toast from './Toast';
import { Phone, PhoneOff, Video } from 'lucide-react';
import VideoConsultation from './VideoConsultation';

export default function NotificationManager() {
    const { data: session } = useSession();
    const [toast, setToast] = useState(null);
    const [permission, setPermission] = useState('default');

    // Call States
    const [incomingCall, setIncomingCall] = useState(null); // { from, name, roomId }
    const [showVideo, setShowVideo] = useState(false);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const ringtoneRef = useRef(null);

    // Ringtone Logic
    const startRingtone = useCallback(() => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.5); // A5

            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8);

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 1);

            // Loop it
            ringtoneRef.current = setInterval(() => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
                g.gain.setValueAtTime(0.1, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                osc.connect(g);
                g.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 1);
            }, 2000);
        } catch (e) {
            console.error("Audio failed", e);
        }
    }, []);

    const stopRingtone = useCallback(() => {
        if (ringtoneRef.current) {
            clearInterval(ringtoneRef.current);
            ringtoneRef.current = null;
        }
    }, []);

    const playNotificationSound = useCallback(() => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880.00, context.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) { }
    }, []);

    const showBrowserNotification = useCallback((title, options) => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { icon: '/favicon.ico', ...options });
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }

        const socket = getSocket();
        if (socket && session?.user) {
            socket.emit('join_room', session.user.id);

            socket.on('notification', (data) => {
                playNotificationSound();
                setToast({ message: data.title + ": " + data.message, type: 'info' });
                showBrowserNotification(data.title, { body: data.message, tag: data.type });
            });

            // Handle Incoming Video Call
            socket.on('incoming-call', (data) => {
                console.log("[WebRTC] Incoming Call Alert:", data);
                setIncomingCall(data);
                startRingtone();

                // Show notification even if window minimized
                showBrowserNotification(`Incoming Call from ${data.name}`, {
                    body: "Click to join the consultation",
                    tag: 'call',
                    requireInteraction: true
                });
            });

            return () => {
                socket.off('notification');
                socket.off('incoming-call');
            };
        }
    }, [session, playNotificationSound, showBrowserNotification, startRingtone]);

    const acceptCall = () => {
        stopRingtone();
        setActiveRoomId(incomingCall.roomId);
        setShowVideo(true);
        setIncomingCall(null);
    };

    const declineCall = () => {
        stopRingtone();
        const socket = getSocket();
        if (socket && incomingCall) {
            socket.emit('leave-call', { roomId: incomingCall.roomId });
        }
        setIncomingCall(null);
    };

    const requestPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Incoming Call Modal */}
            {incomingCall && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-blue-500/30">
                            <Video className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
                        <p className="text-slate-400 mb-8">{incomingCall.name} is inviting you to a consultation.</p>

                        <div className="flex gap-4">
                            <button
                                onClick={declineCall}
                                className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-4 rounded-2xl font-bold transition-all border border-red-500/20"
                            >
                                <PhoneOff className="w-5 h-5 mx-auto mb-1" />
                                Decline
                            </button>
                            <button
                                onClick={acceptCall}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Phone className="w-5 h-5 mx-auto mb-1" />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Consultation Wrapper */}
            {showVideo && (
                <div className="fixed inset-0 z-[11000]">
                    <VideoConsultation
                        roomId={activeRoomId}
                        user={session?.user}
                    />
                    <button
                        onClick={() => setShowVideo(false)}
                        className="fixed top-6 right-6 z-[12000] bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-md"
                    >
                        Minimize
                    </button>
                </div>
            )}

            {/* Permission Banner */}
            {permission === 'default' && session?.user && (
                <div className="fixed top-[10px] left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-xl border border-white/10 text-sm">
                    <span>🔔 Enable notifications for real-time alerts?</span>
                    <button onClick={requestPermission} className="bg-blue-600 px-3 py-1 rounded-full font-bold">Allow</button>
                    <button onClick={() => setPermission('denied')} className="text-slate-400">Later</button>
                </div>
            )}
        </>
    );
}
