"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ChevronLeft, UserPlus, Camera } from 'lucide-react';
import { getSocket } from '@/lib/socket';

import { createPortal } from 'react-dom';

/**
 * VideoConsultation — Twilio Video powered telehealth component.
 * Props:
 *   - roomId:  unique room identifier (used as Twilio room name)
 *   - user:    session user object ({ id, name, ... })
 *   - onLeave: optional callback to close the video modal without navigating back
 */
const VideoConsultation = ({ roomId, user, onLeave }) => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // State
    const [room, setRoom] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);
    const [remoteParticipants, setRemoteParticipants] = useState([]);
    const [callStatus, setCallStatus] = useState('connecting'); // connecting | connected | ended
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isCameraSwitching, setIsCameraSwitching] = useState(false);
    const [facingMode, setFacingMode] = useState('user');
    const [pinnedParticipantId, setPinnedParticipantId] = useState('local');
    const [showAddModal, setShowAddModal] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    const localVideoRef = useRef();
    const roomRef = useRef(null);

    // ── Attach a track to a DOM element ──
    const attachTrack = useCallback((track, element) => {
        if (element && track) {
            // Clear any previous children
            element.innerHTML = '';
            element.appendChild(track.attach());
        }
    }, []);

    // ── Connect to Twilio Video Room ──
    useEffect(() => {
        let cancelled = false;

        const connect = async () => {
            try {
                setCallStatus('connecting');
                setError(null);

                // 1. Dynamically import twilio-video (client-side only)
                const Video = await import('twilio-video');

                // 2. Fetch an access token from our API
                const res = await fetch('/api/twilio-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomName: roomId }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to get video token');
                }

                const { token } = await res.json();

                if (cancelled) return;

                // 3. Connect to the room
                const twilioRoom = await Video.connect(token, {
                    name: roomId,
                    audio: true,
                    video: true,
                    dominantSpeaker: true,
                    networkQuality: { local: 1, remote: 1 },
                });

                if (cancelled) {
                    twilioRoom.disconnect();
                    return;
                }

                roomRef.current = twilioRoom;
                setRoom(twilioRoom);
                setCallStatus('connected');

                // 4. Attach local tracks
                const localTracksList = Array.from(twilioRoom.localParticipant.tracks.values())
                    .map(pub => pub.track)
                    .filter(Boolean);
                setLocalTracks(localTracksList);

                // Attach local video to the ref
                const localVideoTrack = localTracksList.find(t => t.kind === 'video');
                if (localVideoTrack && localVideoRef.current) {
                    attachTrack(localVideoTrack, localVideoRef.current);
                }

                // 5. Handle existing remote participants
                twilioRoom.participants.forEach(participant => {
                    handleParticipantConnected(participant);
                });

                // 6. Listen for new participants
                twilioRoom.on('participantConnected', handleParticipantConnected);
                twilioRoom.on('participantDisconnected', handleParticipantDisconnected);
                twilioRoom.on('disconnected', () => {
                    setCallStatus('ended');
                });

                console.log(`[Twilio Video] Connected to room: ${roomId}`);

            } catch (err) {
                console.error('[Twilio Video] Connection error:', err);
                setError(err.message);
                setCallStatus('ended');
            }
        };

        // ── Participant handlers ──
        const handleParticipantConnected = (participant) => {
            console.log(`[Twilio Video] Participant connected: ${participant.identity}`);

            setRemoteParticipants(prev => {
                if (prev.find(p => p.sid === participant.sid)) return prev;
                // Auto pin the first remote participant
                setPinnedParticipantId(currentPinned => {
                    if (prev.length === 0 && currentPinned === 'local') {
                        return participant.sid;
                    }
                    return currentPinned;
                });
                return [...prev, participant];
            });

            // Subscribe to their existing tracks
            participant.tracks.forEach(publication => {
                if (publication.isSubscribed && publication.track) {
                    // Track is already available
                }
            });

            // Listen for new track subscriptions
            participant.on('trackSubscribed', () => {
                // Force re-render so the track ref can attach
                setRemoteParticipants(prev => [...prev]);
            });

            participant.on('trackUnsubscribed', () => {
                setRemoteParticipants(prev => [...prev]);
            });
        };

        const handleParticipantDisconnected = (participant) => {
            console.log(`[Twilio Video] Participant disconnected: ${participant.identity}`);
            setRemoteParticipants(prev => prev.filter(p => p.sid !== participant.sid));
            setPinnedParticipantId(prev => prev === participant.sid ? 'local' : prev);
        };

        connect();

        return () => {
            cancelled = true;
            if (roomRef.current) {
                roomRef.current.localParticipant.tracks.forEach(pub => {
                    if (pub.track) {
                        pub.track.stop();
                        pub.unpublish();
                    }
                });
                roomRef.current.disconnect();
                roomRef.current = null;
            }
        };
    }, [roomId, attachTrack]);

    // ── Call Controls ──
    const toggleMute = () => {
        if (!roomRef.current) return;
        roomRef.current.localParticipant.audioTracks.forEach(pub => {
            if (isMuted) {
                pub.track.enable();
            } else {
                pub.track.disable();
            }
        });
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        if (!roomRef.current) return;
        roomRef.current.localParticipant.videoTracks.forEach(pub => {
            if (isVideoOff) {
                pub.track.enable();
            } else {
                pub.track.disable();
            }
        });
        setIsVideoOff(!isVideoOff);
    };

    const toggleCamera = async () => {
        if (!roomRef.current) return;
        setIsCameraSwitching(true);
        try {
            const Video = await import('twilio-video');
            const currentVideoTrack = Array.from(roomRef.current.localParticipant.videoTracks.values())[0]?.track;
            if (!currentVideoTrack) return;

            const currentFacingMode = currentVideoTrack.mediaStreamTrack.getSettings().facingMode || 'user';
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            setFacingMode(newFacingMode);

            // Create new video track
            const newTrack = await Video.createLocalVideoTrack({
                facingMode: newFacingMode
            });

            // Unpublish old, publish new
            roomRef.current.localParticipant.unpublishTrack(currentVideoTrack);
            currentVideoTrack.stop();
            roomRef.current.localParticipant.publishTrack(newTrack);

            // Update local preview
            if (localVideoRef.current) {
                attachTrack(newTrack, localVideoRef.current);
            }

            setLocalTracks(prev => prev.map(t => t.kind === 'video' ? newTrack : t));
        } catch (e) {
            console.error('[Twilio Video] Camera Switch Failed:', e);
        } finally {
            setIsCameraSwitching(false);
        }
    };

    const leaveCall = () => {
        if (roomRef.current) {
            roomRef.current.localParticipant.tracks.forEach(pub => {
                if (pub.track) {
                    pub.track.stop();
                    pub.unpublish();
                }
            });
            roomRef.current.disconnect();
            roomRef.current = null;
        }
        setCallStatus('ended');
        if (onLeave) {
            onLeave();
        } else {
            router.back();
        }
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert("Room ID copied to clipboard. Share it with participants!");
    };

    // ── Add Participant Modal Handlers ──
    const openAddParticipantModal = async () => {
        setShowAddModal(true);
        if (usersList.length === 0) {
            setIsLoadingUsers(true);
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsersList(data.filter(u => u.id !== user?.id)); // exclude self
                }
            } catch (e) {
                console.error("Failed to fetch users", e);
            } finally {
                setIsLoadingUsers(false);
            }
        }
    };

    const callUser = (targetUser) => {
        const socket = getSocket();
        if (socket) {
            socket.emit('incoming_video_call', {
                recipientId: targetUser.id,
                callerName: user?.name || 'A user',
                callerId: user?.id,
                roomId: roomId
            });
            alert(`Ringing ${targetUser.name}... They will receive a pop-up to join!`);
            setShowAddModal(false);
        } else {
            alert("Socket not connected. Please try again.");
        }
    };

    // ── Render helper for remote participant video ──
    const RemoteParticipantView = ({ participant, isPinned, onClick }) => {
        const videoRef = useRef();
        const audioRef = useRef();

        useEffect(() => {
            const attachTracks = () => {
                participant.tracks.forEach(publication => {
                    if (publication.isSubscribed && publication.track) {
                        if (publication.track.kind === 'video' && videoRef.current) {
                            videoRef.current.innerHTML = '';
                            videoRef.current.appendChild(publication.track.attach());
                        }
                        if (publication.track.kind === 'audio' && audioRef.current) {
                            audioRef.current.innerHTML = '';
                            audioRef.current.appendChild(publication.track.attach());
                        }
                    }
                });
            };

            attachTracks();

            const onTrackSubscribed = (track) => {
                if (track.kind === 'video' && videoRef.current) {
                    videoRef.current.innerHTML = '';
                    videoRef.current.appendChild(track.attach());
                }
                if (track.kind === 'audio' && audioRef.current) {
                    audioRef.current.innerHTML = '';
                    audioRef.current.appendChild(track.attach());
                }
            };

            const onTrackUnsubscribed = (track) => {
                track.detach().forEach(el => el.remove());
            };

            participant.on('trackSubscribed', onTrackSubscribed);
            participant.on('trackUnsubscribed', onTrackUnsubscribed);

            return () => {
                participant.off('trackSubscribed', onTrackSubscribed);
                participant.off('trackUnsubscribed', onTrackUnsubscribed);
            };
        }, [participant]);

        return (
            <div 
                className={`video-wrapper ${isPinned ? 'pinned' : 'thumbnail'}`}
                onClick={onClick}
            >
                <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
                <div ref={audioRef} style={{ display: 'none' }} />
                <div className="participant-label">{participant.identity || 'Guest'}</div>
            </div>
        );
    };

    if (!mounted) return null;

    // Grouping users
    const filteredUsers = usersList.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const professionals = filteredUsers.filter(u => u.role !== 'patient');
    const patients = filteredUsers.filter(u => u.role === 'patient');

    const renderUserItem = (u) => (
        <div key={u.id} className="modal-user-item">
            <div className="user-info">
                <div className="user-name">{u.name}</div>
                <div className="user-role">{u.role}</div>
            </div>
            <button onClick={() => callUser(u)} className="btn-ring">
                Ring
            </button>
        </div>
    );

    const content = (
        <div className="video-consultation-container">
            <style jsx>{`
                .video-consultation-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    background-color: #0f172a;
                    display: flex;
                    flex-direction: column;
                    font-family: var(--font-sans), sans-serif;
                    overflow: hidden;
                }
                .video-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 1.5rem;
                    z-index: 1050;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
                    pointer-events: none;
                }
                .header-btn {
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255,255,255,0.9);
                    background: rgba(255,255,255,0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                    backdrop-filter: blur(10px);
                }
                .header-btn:hover { background: rgba(255,255,255,0.2); color: white; }
                .header-btn.add-participant {
                    background: linear-gradient(135deg, #0ea5e9, #2563eb);
                    border: none;
                    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
                }
                .header-btn.add-participant:hover { filter: brightness(1.1); transform: translateY(-2px); }
                .status-badge {
                    pointer-events: auto;
                    background: rgba(37, 99, 235, 0.2);
                    color: #60a5fa;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    font-weight: bold;
                    font-size: 0.875rem;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    backdrop-filter: blur(10px);
                }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-dot.connected { background-color: #10b981; }
                .status-dot.connecting { background-color: #f59e0b; animation: pulse 2s infinite; }
                .status-dot.ended { background-color: #ef4444; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

                .video-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding: 80px 12px 100px;
                    width: 100%;
                    height: 100dvh;
                    overflow-y: auto;
                    align-content: flex-start;
                    justify-content: center;
                    box-sizing: border-box;
                }
                .video-wrapper {
                    position: relative;
                    background: #111827;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid rgba(255,255,255,0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .video-wrapper.pinned {
                    width: 100%;
                    height: calc(100dvh - 360px); /* Leave room for padding + thumbnails */
                    min-height: 300px;
                    order: 1;
                    cursor: default;
                }
                .video-wrapper.pinned video { width: 100% !important; height: 100% !important; object-fit: contain !important; background: #000; }
                .video-wrapper.thumbnail {
                    width: 120px;
                    height: 160px;
                    order: 2;
                    opacity: 0.8;
                }
                .video-wrapper.thumbnail:hover { opacity: 1; transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.5); }
                .video-wrapper.thumbnail video { width: 100% !important; height: 100% !important; object-fit: contain !important; background: #000; }

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
                    pointer-events: none;
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
                    .video-grid { padding: 80px 8px 90px; }
                    .video-wrapper.pinned { height: calc(100dvh - 300px); min-height: 250px; }
                    .video-wrapper.thumbnail { width: 90px; height: 120px; }
                    .controls { width: 90%; gap: 10px; padding: 12px; bottom: 20px; }
                    .control-btn { width: 44px; height: 44px; }
                    .header-text { display: none; }
                }

                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 1200;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    pointer-events: auto;
                }
                .modal-content {
                    background: #1e293b;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    width: 100%; max-width: 450px;
                    overflow: hidden;
                    display: flex; flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .modal-header {
                    padding: 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex; justify-content: space-between; align-items: center;
                    background: #0f172a;
                }
                .modal-header h3 { color: white; font-size: 1.1rem; margin: 0; }
                .modal-close {
                    background: none; border: none; color: rgba(255, 255, 255, 0.5);
                    font-size: 1.5rem; cursor: pointer; transition: color 0.2s; line-height: 1;
                }
                .modal-close:hover { color: white; }
                .modal-search { padding: 1rem; background: #1e293b; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
                .modal-search input {
                    width: 100%; background: #0f172a; color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px;
                    padding: 0.75rem 1rem; font-size: 0.95rem; outline: none;
                }
                .modal-search input:focus { border-color: #3b82f6; }
                .modal-body { padding: 0.5rem; overflow-y: auto; max-height: 400px; background: #1e293b; }
                .section-title {
                    color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase;
                    letter-spacing: 0.05em; padding: 0.5rem 1rem; margin-top: 0.5rem; font-weight: 600;
                }
                .modal-user-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0.75rem 1rem; border-radius: 12px; transition: background 0.2s;
                }
                .modal-user-item:hover { background: rgba(255, 255, 255, 0.05); }
                .user-name { color: white; font-weight: 500; margin-bottom: 0.25rem; }
                .user-role { color: rgba(255, 255, 255, 0.5); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .btn-ring {
                    background: linear-gradient(135deg, #10b981, #2563eb); /* Green to Blue */
                    color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 8px;
                    font-size: 0.85rem; font-weight: 600; cursor: pointer;
                    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); transition: all 0.2s;
                }
                .btn-ring:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4); }
                .modal-footer {
                    padding: 1rem; background: #0f172a; border-top: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center; font-size: 0.85rem; color: rgba(255, 255, 255, 0.4);
                }
                .link-btn { background: none; border: none; color: #3b82f6; font-weight: 500; cursor: pointer; margin-left: 0.25rem; }
                .link-btn:hover { text-decoration: underline; }
                .video-error {
                    position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1060;
                    background: rgba(220, 38, 38, 0.2); color: #fca5a5; padding: 0.75rem 1.5rem;
                    border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3); backdrop-filter: blur(10px);
                    font-size: 0.9rem; max-width: 90%; text-align: center;
                }
                .center-status {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    width: 100%; height: 100%; color: rgba(255, 255, 255, 0.4); font-size: 0.85rem; padding: 2rem;
                }
                .spinner {
                    width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Header */}
            <div className="video-header">
                <button onClick={leaveCall} className="header-btn">
                    <ChevronLeft size={20} />
                    <span className="header-text">Leave Call</span>
                </button>
                <div className="status-badge">
                    <span className={`status-dot ${callStatus}`} />
                    {callStatus === 'connecting' ? 'CONNECTING...' : callStatus === 'connected' ? `TELEHEALTH ROOM` : 'DISCONNECTED'}
                </div>
                <button onClick={openAddParticipantModal} className="header-btn add-participant">
                    <UserPlus size={20} />
                    <span className="header-text">Add Participant</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="video-error">
                    ⚠️ {error}
                </div>
            )}

            {/* Video Grid */}
            <div className="video-grid">
                {/* Local User */}
                <div 
                    className={`video-wrapper local ${pinnedParticipantId === 'local' ? 'pinned' : 'thumbnail'}`}
                    onClick={() => setPinnedParticipantId('local')}
                >
                    <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                    {isVideoOff && (
                        <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <VideoOff size={48} color="#444" />
                        </div>
                    )}
                    <div className="participant-label">You ({user?.name || 'Local'})</div>
                </div>

                {/* Remote Participants */}
                {remoteParticipants.map(participant => (
                    <RemoteParticipantView 
                        key={participant.sid} 
                        participant={participant} 
                        isPinned={pinnedParticipantId === participant.sid}
                        onClick={() => setPinnedParticipantId(participant.sid)}
                    />
                ))}

                {/* Empty State */}
                {remoteParticipants.length === 0 && callStatus === 'connected' && (
                    <div className="video-wrapper thumbnail" style={{ opacity: 0.5, borderStyle: 'dashed' }}>
                        <div className="center-status">
                            <span style={{ fontSize: '24px', marginBottom: '8px' }}>📡</span>
                            <span>Waiting...</span>
                        </div>
                    </div>
                )}

                {/* Connecting State */}
                {callStatus === 'connecting' && (
                    <div className="video-wrapper thumbnail">
                        <div className="center-status">
                            <div className="spinner"></div>
                            <span>Connecting...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
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
                    className={`control-btn secondary`}
                    disabled={isCameraSwitching}
                    title="Switch Camera"
                >
                    <Camera />
                </button>
                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
                <button
                    onClick={leaveCall}
                    className="control-btn danger"
                    title="End Call"
                >
                    <PhoneOff />
                </button>
            </div>

            {/* Add Participant Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Participant</h3>
                            <button onClick={() => setShowAddModal(false)} className="modal-close">&times;</button>
                        </div>
                        <div className="modal-search">
                            <input 
                                type="text" 
                                placeholder="Search by name or role..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="modal-body">
                            {isLoadingUsers ? (
                                <div className="center-status" style={{ padding: '2rem 0' }}>Loading users...</div>
                            ) : filteredUsers.length > 0 ? (
                                <>
                                    {professionals.length > 0 && (
                                        <>
                                            <div className="section-title">Professionals</div>
                                            {professionals.map(renderUserItem)}
                                        </>
                                    )}
                                    {patients.length > 0 && (
                                        <>
                                            <div className="section-title">Patients</div>
                                            {patients.map(renderUserItem)}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="center-status" style={{ padding: '2rem 0' }}>No users found.</div>
                            )}
                        </div>
                        <div className="modal-footer">
                            Or share link manually: <button onClick={copyRoomId} className="link-btn">Copy ID</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(content, document.body);
};

export default VideoConsultation;
