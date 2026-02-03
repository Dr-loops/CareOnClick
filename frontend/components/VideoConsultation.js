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
        socket.emit('join_room', targetRoomId);

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
            setOtherUser({ id: data.from, name: data.name });
            setCallStatus('incoming');
            connectionRef.current = createPeerConnection(data.from);
            connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
        });

        socket.on('answer-made', async (data) => {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
            setCallStatus('connected');
        });

        socket.on('ice-candidate-received', (data) => {
            if (connectionRef.current) {
                connectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (connectionRef.current) connectionRef.current.close();
        };
    }, [targetRoomId]);

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
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (connectionRef.current) connectionRef.current.close();
        router.back();
    };

    return (
        <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col font-sans">
            {/* Header / Back Button */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="text-white font-medium text-sm drop-shadow-lg">
                    {callStatus === 'connected' ? `In call with ${otherUser?.name || 'Patient'}` : 'Video Consultation'}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
                {remoteStream ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 animate-pulse">
                            <span className="text-4xl text-slate-500">👤</span>
                        </div>
                        <p className="text-slate-400 font-medium">
                            {callStatus === 'calling' ? 'Calling...' :
                                callStatus === 'incoming' ? `${otherUser?.name} is calling...` :
                                    'Waiting for participant...'}
                        </p>
                    </div>
                )}
            </div>

            {/* My Video (Floating Box) */}
            <div className={`absolute top-20 right-4 z-30 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 transition-all duration-500 ${callStatus === 'idle' ? 'scale-150 top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2' : ''}`}>
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                {isVideoOff && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                        <VideoOff className="w-8 h-8 text-slate-600" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white font-medium backdrop-blur-md">
                    You
                </div>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-50 flex flex-col items-center">
                {callStatus === 'incoming' && (
                    <div className="mb-8 animate-bounce">
                        <Button variant="success" size="lg" onClick={answerCall} className="rounded-full px-10 py-6 scale-110 shadow-2xl shadow-green-500/50">
                            Answer Call
                        </Button>
                    </div>
                )}

                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                    {callStatus === 'idle' ? (
                        <button
                            onClick={callUser}
                            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-green-500/20"
                        >
                            <VideoIcon className="w-7 h-7 text-white" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>

                            <button
                                onClick={leaveCall}
                                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-red-500/40"
                            >
                                <PhoneOff className="w-8 h-8 text-white" />
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* CSS Overrides for smooth video */}
            <style jsx>{`
                video {
                    transform: rotateY(180deg);
                    -webkit-transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
};

export default VideoConsultation;
