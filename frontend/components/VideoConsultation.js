"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const VideoConsultation = ({ roomId, patientId, user }) => {
    const targetRoomId = roomId || patientId;
    const router = useRouter();

    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, connected, ended
    const [otherUser, setOtherUser] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socketRef = useRef();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        socketRef.current = socket;

        // [FIX] Join both the shared consultation room AND your own private ID room 
        // to ensure you can receive private signaling responses.
        socket.emit('join_room', targetRoomId);
        socket.emit('join_room', user.id);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
                alert("Could not access camera/microphone. Please ensure permissions are granted.");
            });

        socket.on('call-made', (data) => {
            if (data.from === user.id) return; // Ignore self
            console.log("Incoming call from:", data.name, data.from);
            setOtherUser({ id: data.from, name: data.name });
            setCallStatus('incoming');
            connectionRef.current = createPeerConnection(data.from);
            connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
        });

        socket.on('answer-made', async (data) => {
            if (data.answerId === socket.id) return; // Ignore self
            console.log("Call answered by partner");
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
            setCallStatus('connected');
        });

        socket.on('ice-candidate-received', (data) => {
            if (data.from === socket.id) return; // Ignore self
            if (connectionRef.current) {
                console.log("Adding ICE candidate from partner");
                connectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socket.on('call-ended', () => {
            console.log("Partner left the call");
            setCallStatus('ended');
            if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
            setRemoteStream(null);
            alert("The other participant has left the call.");
            router.back();
        });

        return () => {
            console.log("Cleaning up video session");
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (connectionRef.current) connectionRef.current.close();
        };
    }, [targetRoomId, user.id]);

    const createPeerConnection = (partnerId) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
            ]
        });

        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: partnerId
                });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        return peer;
    };

    const callUser = async () => {
        const peer = createPeerConnection(targetRoomId);
        connectionRef.current = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        setCallStatus('calling');
        socketRef.current.emit('call-user', {
            userToCall: targetRoomId,
            signalData: offer,
            from: user.id,
            name: user.name
        });
    };

    const answerCall = async () => {
        const peer = connectionRef.current;
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        setCallStatus('connected');
        socketRef.current.emit('make-answer', {
            signal: answer,
            to: otherUser.id
        });
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    const leaveCall = () => {
        setCallStatus('ended');
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped track: ${track.kind}`);
            });
        }
        if (connectionRef.current) {
            connectionRef.current.close();
        }
        // Notify other user if possible
        if (socketRef.current && otherUser) {
            socketRef.current.emit('leave-call', { to: otherUser.id });
        }
        router.back();
    };

    const toggleCamera = async () => {
        if (!stream) return;

        const currentFacingMode = stream.getVideoTracks()[0].getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: true
            });

            // Replace tracks in peer connection
            if (connectionRef.current) {
                const videoTrack = newStream.getVideoTracks()[0];
                const sender = connectionRef.current.getSenders().find(s => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            // Update local stream
            stream.getTracks().forEach(track => track.stop());
            setStream(newStream);
            if (myVideo.current) {
                myVideo.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error toggling camera:", err);
            alert("Could not switch camera. Make sure you have multiple cameras available.");
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-950 overflow-hidden flex flex-col font-sans">
            <style jsx global>{`
                video {
                    transform: rotateY(180deg);
                    -webkit-transform: rotateY(180deg);
                    object-fit: cover;
                }
                .video-container {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #020617;
                }
                /* PC Portrait Mode */
                @media (min-width: 1024px) {
                    .pc-portrait-container {
                        max-width: 450px;
                        height: 85vh;
                        margin: auto;
                        border-radius: 30px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7);
                        border: 8px solid #1e293b;
                    }
                }
            `}</style>

            <div className="pc-portrait-container w-full h-full flex flex-col relative bg-slate-950">

                {/* Header / Back Button */}
                <div className="absolute top-0 left-0 right-0 p-6 z-[1050] flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                    <button
                        onClick={leaveCall}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95 pointer-events-auto backdrop-blur-md border border-white/10"
                        title="End Call"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="text-white font-semibold text-sm md:text-base px-4 py-2 bg-black/30 rounded-full backdrop-blur-md border border-white/5 shadow-2xl">
                        {callStatus === 'connected' ? (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Live: {otherUser?.name || 'Session'}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                Telehealth Room
                            </span>
                        )}
                    </div>
                    <div className="w-12" />
                </div>

                {/* Remote Video (Full Screen) */}
                <div className="video-container z-0">
                    {remoteStream ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full" />
                    ) : (
                        <div className="flex flex-col items-center p-8 text-center">
                            <div className="w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center mb-6 border-2 border-slate-800 shadow-inner animate-pulse">
                                <span className="text-5xl opacity-40">👤</span>
                            </div>
                            <p className="text-slate-300 font-bold text-xl mb-2">
                                {callStatus === 'calling' ? 'Calling...' :
                                    callStatus === 'incoming' ? `${otherUser?.name} is calling...` :
                                        'Waiting for participant...'}
                            </p>
                            <p className="text-slate-500 text-sm max-w-xs">
                                The call will start automatically once they join the room.
                            </p>
                        </div>
                    )}
                </div>

                {/* My Video (Floating Box) */}
                <div className={`absolute top-24 right-6 z-[1040] w-32 md:w-36 aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 transition-all duration-700 ease-in-out ${callStatus === 'idle' ? 'scale-[1.8] md:scale-[2] top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2' : 'hover:scale-105'}`}>
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full" />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                            <VideoOff className="w-10 h-10 text-slate-700" />
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3 text-[11px] bg-black/60 px-2 py-1 rounded-lg text-white font-bold backdrop-blur-xl border border-white/10 tracking-wider">
                        YOU
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-10 left-0 right-0 p-8 z-[1060] flex flex-col items-center">
                    {callStatus === 'incoming' && (
                        <div className="mb-8 animate-bounce">
                            <Button variant="success" size="lg" onClick={answerCall} className="rounded-full px-12 py-7 scale-125 shadow-[0_20px_50px_rgba(34,197,94,0.4)] font-bold text-lg">
                                Accept Consult
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center gap-4 md:gap-6 bg-slate-900/80 backdrop-blur-2xl px-6 py-4 md:px-10 md:py-6 rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                        {callStatus === 'idle' ? (
                            <>
                                <button
                                    onClick={callUser}
                                    className="w-16 h-16 bg-blue-600 hover:bg-blue-500 active:scale-90 rounded-full flex items-center justify-center transition-all shadow-xl shadow-blue-500/20 group"
                                    title="Start Consultation"
                                >
                                    <VideoIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={leaveCall}
                                    className="w-16 h-16 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-full flex items-center justify-center transition-all"
                                    title="Leave Room"
                                >
                                    <PhoneOff className="w-7 h-7" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleMute}
                                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${isMuted ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                                </button>

                                <button
                                    onClick={toggleCamera}
                                    className="w-12 h-12 md:w-14 md:h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 border border-white/5 transition-all"
                                    title="Switch Camera"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h2l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /><path d="m18 13-3 3 3 3" /><path d="m6 13 3-3-3-3" /></svg>
                                </button>

                                <button
                                    onClick={leaveCall}
                                    className="w-16 h-16 md:w-20 md:h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl shadow-red-600/40 border-4 border-white/5"
                                    title="End Call"
                                >
                                    <PhoneOff className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </button>

                                <button
                                    onClick={toggleVideo}
                                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${isVideoOff ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}
                                    title={isVideoOff ? "Start Video" : "Stop Video"}
                                >
                                    {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <VideoIcon className="w-5 h-5 md:w-6 md:h-6" />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultation;
