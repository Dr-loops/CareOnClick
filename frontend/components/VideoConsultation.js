"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ChevronLeft, UserPlus, Camera } from 'lucide-react';

/**
 * VideoConsultation — Twilio Video powered telehealth component.
 * Props:
 *   - roomId:  unique room identifier (used as Twilio room name)
 *   - user:    session user object ({ id, name, ... })
 */
const VideoConsultation = ({ roomId, user }) => {
    const router = useRouter();

    // State
    const [room, setRoom] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);
    const [remoteParticipants, setRemoteParticipants] = useState([]);
    const [callStatus, setCallStatus] = useState('connecting'); // connecting | connected | ended
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isCameraSwitching, setIsCameraSwitching] = useState(false);
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
                    video: { width: 1280, height: 720 },
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

            const currentFacingMode = currentVideoTrack.mediaStreamTrack.getSettings().facingMode;
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

            // Create new video track
            const newTrack = await Video.createLocalVideoTrack({
                facingMode: newFacingMode,
                width: 1280,
                height: 720,
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
        router.back();
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert("Room ID copied to clipboard. Share it with participants!");
    };

    // ── Render helper for remote participant video ──
    const RemoteParticipantView = ({ participant }) => {
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
            <div className="video-wrapper">
                <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
                <div ref={audioRef} style={{ display: 'none' }} />
                <div className="participant-label">{participant.identity || 'Guest'}</div>
            </div>
        );
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
                .video-wrapper video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .video-wrapper.local {
                    border-color: rgba(59, 130, 246, 0.5);
                }
                .video-wrapper.local video {
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
                    <span className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-green-500' : callStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    {callStatus === 'connecting' ? 'CONNECTING...' : callStatus === 'connected' ? `TELEHEALTH ROOM` : 'DISCONNECTED'}
                </div>
                <button onClick={copyRoomId} className="flex items-center gap-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition-all">
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Participant</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1060] bg-red-600/20 text-red-300 px-6 py-3 rounded-xl border border-red-500/30 backdrop-blur-md text-sm max-w-md text-center">
                    ⚠️ {error}
                </div>
            )}

            {/* Video Grid */}
            <div className="video-grid">
                {/* Local User */}
                <div className="video-wrapper local">
                    <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <VideoOff className="w-16 h-16 text-gray-700" />
                        </div>
                    )}
                    <div className="participant-label">You ({user?.name || 'Local'})</div>
                </div>

                {/* Remote Participants */}
                {remoteParticipants.map(participant => (
                    <RemoteParticipantView key={participant.sid} participant={participant} />
                ))}

                {/* Empty State */}
                {remoteParticipants.length === 0 && callStatus === 'connected' && (
                    <div className="video-wrapper flex items-center justify-center border-dashed border-white/10">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-3xl">📡</span>
                            </div>
                            <h3 className="text-white/40 font-medium">Waiting for participants...</h3>
                            <p className="text-white/20 text-xs mt-2">The other party will join automatically</p>
                        </div>
                    </div>
                )}

                {/* Connecting State */}
                {callStatus === 'connecting' && (
                    <div className="video-wrapper flex items-center justify-center">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                                <span className="text-3xl">🔄</span>
                            </div>
                            <h3 className="text-white/60 font-medium">Connecting to Twilio Video...</h3>
                            <p className="text-white/30 text-xs mt-2">Setting up secure connection</p>
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
