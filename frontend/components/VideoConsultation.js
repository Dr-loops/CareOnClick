"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ChevronLeft, UserPlus, Camera } from 'lucide-react';
import Button from '@/components/ui/Button';

// STUN servers for NAT traversal
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

const VideoConsultation = ({ roomId, user }) => {
    const router = useRouter();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState([]); // Array of { socketId, stream, name }
    const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isCameraSwitching, setIsCameraSwitching] = useState(false);

    const socketRef = useRef();
    const peersRef = useRef({}); // { socketId: RTCPeerConnection }
    const localVideoRef = useRef();

    // 1. Initialize Media
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Media Access Error:", err);
            alert("Could not access camera/microphone. Please check permissions.");
            return null;
        }
    };

    // 2. WebRTC Logic: Create Peer Connection
    const createPeer = (targetSocketId, stream) => {
        const peer = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to peer
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        // When we get remote tracks
        peer.ontrack = (event) => {
            console.log(`[WebRTC] Received remote track from ${targetSocketId}`);
            setRemoteStreams(prev => {
                // Prevent duplicate streams for the same user
                if (prev.find(s => s.socketId === targetSocketId)) return prev;
                return [...prev, { socketId: targetSocketId, stream: event.streams[0], name: 'Participant' }];
            });
        };

        // When we get local ICE candidates, send them to the peer
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('webrtc-ice-candidate', {
                    to: targetSocketId,
                    candidate: event.candidate
                });
            }
        };

        return peer;
    };

    // 3. Coordinate Signaling
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        socketRef.current = socket;

        const init = async () => {
            const stream = await startLocalStream();
            if (!stream) return;

            setCallStatus('connected');
            socket.emit('join-video-room', roomId);

            // A new user joined -> Initiate an offer to them
            socket.on('user-joined', async ({ userId }) => {
                console.log(`[Signaling] New user joined: ${userId}. Creating offer...`);
                const peer = createPeer(userId, stream);
                peersRef.current[userId] = peer;

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('webrtc-offer', { to: userId, offer });
            });

            // Received an offer -> Create an answer
            socket.on('webrtc-offer', async ({ from, offer }) => {
                console.log(`[Signaling] Received offer from ${from}. Creating answer...`);
                const peer = createPeer(from, stream);
                peersRef.current[from] = peer;

                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit('webrtc-answer', { to: from, answer });
            });

            // Received an answer -> Set remote description
            socket.on('webrtc-answer', async ({ from, answer }) => {
                console.log(`[Signaling] Received answer from ${from}. Finalizing connection...`);
                const peer = peersRef.current[from];
                if (peer) {
                    await peer.setRemoteDescription(new RTCSessionDescription(answer));
                }
            });

            // Received ICE Candidate -> Add it
            socket.on('webrtc-ice-candidate', async ({ from, candidate }) => {
                const peer = peersRef.current[from];
                if (peer) {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });

            // User left -> Clean up
            socket.on('user-left', ({ userId }) => {
                console.log(`[Signaling] User ${userId} left the call.`);
                if (peersRef.current[userId]) {
                    peersRef.current[userId].close();
                    delete peersRef.current[userId];
                }
                setRemoteStreams(prev => prev.filter(s => s.socketId !== userId));
            });
        };

        init();

        return () => {
            console.log("Terminating Video Session...");
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            Object.values(peersRef.current).forEach(peer => peer.close());
            socket.emit('leave-call', { roomId });
            socket.off('user-joined');
            socket.off('webrtc-offer');
            socket.off('webrtc-answer');
            socket.off('webrtc-ice-candidate');
            socket.off('user-left');
        };
    }, [roomId]);

    // 4. Call Controls
    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
            setIsMuted(!localStream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            setIsVideoOff(!localStream.getVideoTracks()[0].enabled);
        }
    };

    const toggleCamera = async () => {
        if (!localStream) return;
        setIsCameraSwitching(true);
        try {
            const currentFacingMode = localStream.getVideoTracks()[0].getSettings().facingMode;
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: true
            });

            // Replace tracks in all peer connections
            Object.values(peersRef.current).forEach(peer => {
                const videoTrack = newStream.getVideoTracks()[0];
                const sender = peer.getSenders().find(s => s.track.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });

            // Stop old stream and update UI
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(newStream);
            if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
        } catch (e) {
            console.error("Camera Switch Failed:", e);
        } finally {
            setIsCameraSwitching(false);
        }
    };

    const leaveCall = () => {
        router.back();
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert("Room ID copied to clipboard. Share it with participants!");
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col font-sans overflow-hidden">
            <style jsx>{`
                .video-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 16px;
                    padding: 80px 20px 140px;
                    width: 100%;
                    height: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                    overflow-y: auto;
                }
                .video-wrapper {
                    position: relative;
                    aspect-ratio: 16/9;
                    background: #111827;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid rgba(255,255,255,0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .video-wrapper.local {
                    border-color: rgba(59, 130, 246, 0.5);
                }
                video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: rotateY(180deg);
                }
                .participant-label {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .controls {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 32px;
                    background: rgba(17, 24, 39, 0.8);
                    backdrop-filter: blur(24px);
                    border-radius: 40px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                    z-index: 1100;
                }
                .control-btn {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: white;
                }
                .control-btn.secondary { background: rgba(255,255,255,0.1); }
                .control-btn.secondary:hover { background: rgba(255,255,255,0.2); }
                .control-btn.danger { background: #ef4444; }
                .control-btn.danger:hover { background: #dc2626; transform: scale(1.1); }
                .control-btn.active { background: #ef4444; }
                
                @media (max-width: 640px) {
                    .video-grid { grid-template-columns: 1fr; padding-top: 100px; }
                    .controls { width: 90%; gap: 10px; padding: 12px; }
                    .control-btn { width: 44px; height: 44px; }
                }
            `}</style>

            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-6 z-[1050] flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={leaveCall} className="flex items-center gap-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition-all">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Leave Call</span>
                </button>
                <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl backdrop-blur-md border border-blue-500/20 font-bold text-sm tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    TELEHEALTH ROOM: {roomId}
                </div>
                <button onClick={copyRoomId} className="flex items-center gap-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition-all">
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Participant</span>
                </button>
            </div>

            {/* Video Grid */}
            <div className="video-grid">
                {/* Local User */}
                <div className="video-wrapper local">
                    <video ref={localVideoRef} autoPlay playsInline muted />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <VideoOff className="w-16 h-16 text-gray-700" />
                        </div>
                    )}
                    <div className="participant-label">You (Local)</div>
                </div>

                {/* Remote Users */}
                {remoteStreams.map(({ socketId, stream, name }) => (
                    <div key={socketId} className="video-wrapper">
                        <video
                            autoPlay
                            playsInline
                            ref={el => { if (el) el.srcObject = stream; }}
                        />
                        <div className="participant-label">{name || 'Guest'}</div>
                    </div>
                ))}

                {/* Empty State */}
                {remoteStreams.length === 0 && (
                    <div className="video-wrapper flex items-center justify-center border-dashed border-white/10">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-3xl">📡</span>
                            </div>
                            <h3 className="text-white/40 font-medium">Waiting for participants...</h3>
                            <p className="text-white/20 text-xs mt-2">Share Room ID with your consultant</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Final Controls */}
            <div className="controls">
                <button
                    onClick={toggleMute}
                    className={`control-btn ${isMuted ? 'active' : 'secondary'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`control-btn ${isVideoOff ? 'active' : 'secondary'}`}
                    title={isVideoOff ? "Start Video" : "Stop Video"}
                >
                    {isVideoOff ? <VideoOff /> : <VideoIcon />}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`control-btn secondary ${isCameraSwitching ? 'animate-spin' : ''}`}
                    disabled={isCameraSwitching}
                    title="Switch Camera"
                >
                    <Camera />
                </button>

                <div className="w-px h-8 bg-white/10 mx-2" />

                <button
                    onClick={leaveCall}
                    className="control-btn danger"
                    title="End Call"
                >
                    <PhoneOff />
                </button>
            </div>
        </div>
    );
};

export default VideoConsultation;
