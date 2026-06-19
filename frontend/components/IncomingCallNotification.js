"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/components/AuthProvider';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function IncomingCallNotification() {
    const { user } = useAuth();
    const router = useRouter();
    const [incomingCall, setIncomingCall] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const socket = getSocket();
        if (!socket) return;

        const handleIncomingCall = (data) => {
            if (data.recipientId === user.id) {
                setIncomingCall(data);
                
                // Play ringing sound
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.error("Audio play failed:", e));
                }
            }
        };

        const handleCallEnded = (data) => {
            if (incomingCall && (data.roomId === incomingCall.roomId)) {
                setIncomingCall(null);
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            }
        };

        socket.on('incoming_video_call', handleIncomingCall);
        socket.on('cancel_video_call', handleCallEnded);

        return () => {
            socket.off('incoming_video_call', handleIncomingCall);
            socket.off('cancel_video_call', handleCallEnded);
        };
    }, [user, incomingCall]);

    const handleAccept = () => {
        if (audioRef.current) audioRef.current.pause();
        
        const roomId = incomingCall.roomId;
        setIncomingCall(null);
        
        // Navigate to the video consultation room
        router.push(`/consultation/${roomId}`);
    };

    const handleDecline = () => {
        if (audioRef.current) audioRef.current.pause();
        
        // Optionally notify caller that call was declined
        const socket = getSocket();
        if (socket && incomingCall) {
            socket.emit('decline_video_call', { 
                callerId: incomingCall.callerId, 
                recipientName: user.name 
            });
        }
        
        setIncomingCall(null);
    };

    if (!incomingCall) {
        return (
            <audio 
                ref={audioRef} 
                src="/sounds/ringtone.mp3" 
                loop 
                preload="auto" 
                style={{ display: 'none' }} 
            />
        );
    }

    return (
        <div style={styles.overlay}>
            <audio 
                ref={audioRef} 
                src="/sounds/ringtone.mp3" 
                loop 
                preload="auto" 
                style={{ display: 'none' }} 
            />
            <div style={styles.modal}>
                <div style={styles.header}>
                    <Video size={32} color="white" />
                </div>
                <div style={styles.body}>
                    <h3 style={styles.title}>Incoming Video Call</h3>
                    <p style={styles.caller}>{incomingCall.callerName}</p>
                    <p style={styles.subtitle}>is calling you for a consultation...</p>
                    
                    <div style={styles.buttonContainer}>
                        <button onClick={handleDecline} style={{...styles.button, ...styles.declineButton}}>
                            <PhoneOff size={24} />
                            <span>Decline</span>
                        </button>
                        <button onClick={handleAccept} style={{...styles.button, ...styles.acceptButton}}>
                            <Phone size={24} />
                            <span>Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999, // Ensure it's above everything
        backdropFilter: 'blur(5px)',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '24px',
        width: '350px',
        maxWidth: '90%',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s ease-out',
    },
    header: {
        backgroundColor: '#2563eb', // Blue-600
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        padding: '32px 24px',
        textAlign: 'center',
    },
    title: {
        margin: '0 0 8px 0',
        color: '#64748b', // Slate-500
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    caller: {
        margin: '0 0 8px 0',
        color: '#0f172a', // Slate-900
        fontSize: '24px',
        fontWeight: 'bold',
    },
    subtitle: {
        margin: '0 0 32px 0',
        color: '#64748b',
        fontSize: '16px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
    },
    button: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '16px',
        borderRadius: '16px',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        fontWeight: 'bold',
        transition: 'transform 0.1s, filter 0.2s',
    },
    declineButton: {
        backgroundColor: '#ef4444', // Red-500
    },
    acceptButton: {
        backgroundColor: '#10b981', // Emerald-500
        animation: 'pulse 2s infinite',
    }
};
