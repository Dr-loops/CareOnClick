"use client";
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

let socket;

export default function CollaborationTab({ user, selectedPatientId }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const [careTeam, setCareTeam] = useState([]);

    // Refs
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Initial connection and room joining
    useEffect(() => {
        // ... (Socket logic remains) ...
        if (!socket) {
            socket = io();
        }

        function onConnect() {
            setIsConnected(true);
            console.log('Connected to socket server');
            if (selectedPatientId) {
                socket.emit('join_room', selectedPatientId);
            }
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        }

        function onReceiveMessage(msg) {
            setMessages(prev => {
                // Deduplicate based on ID
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            // Scroll to bottom when new message arrives
            setTimeout(() => scrollToBottom(), 100);

            // Dynamic Team Update on receiving message
            updateCareTeamFromMessage(msg);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', onReceiveMessage);

        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_message', onReceiveMessage);
        };
    }, [selectedPatientId]);

    // Helper to update Care Team from a message
    const updateCareTeamFromMessage = (msg) => {
        setCareTeam(prev => {
            if (prev.some(m => m.name === msg.sender)) return prev; // Already exists
            // Ignore system/patient messages if you only want pro team, but user asked for "professionals"
            if (msg.role === 'patient') return prev;

            return [...prev, {
                name: msg.sender,
                role: msg.role || 'Professional',
                active: true, // Mark active as they just messaged
                isSelf: msg.sender === user.name
            }];
        });
    };

    // Handle patient change (room switching) & Fetch History
    useEffect(() => {
        if (selectedPatientId) {
            if (socket && socket.connected) {
                socket.emit('join_room', selectedPatientId);
            }

            // Fetch History
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`/api/messages?patientId=${selectedPatientId}`);
                    if (res.ok) {
                        const data = await res.json();

                        // 1. Transform Messages
                        const uiMessages = data.map(m => ({
                            id: m.id,
                            sender: m.senderName,
                            role: m.role,
                            text: m.content,
                            attachment: null,
                            patientId: m.recipientId,
                            timestamp: m.timestamp || m.createdAt
                        }));

                        uiMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                        setMessages(uiMessages);

                        // 2. Build Dynamic Care Team
                        const membersMap = new Map();

                        // Always include SELF first
                        membersMap.set(user.name, {
                            name: user.name,
                            role: user.role,
                            active: true,
                            isSelf: true
                        });

                        // Add members from history
                        uiMessages.forEach(msg => {
                            if (msg.role !== 'patient' && !membersMap.has(msg.sender)) {
                                membersMap.set(msg.sender, {
                                    name: msg.sender,
                                    role: msg.role,
                                    active: false, // Inferred from history
                                    isSelf: msg.sender === user.name
                                });
                            }
                        });

                        setCareTeam(Array.from(membersMap.values()));
                    }
                } catch (e) {
                    console.error("Failed to fetch message history", e);
                }
            };

            fetchHistory(); // Initial fetch

            // Polling Fallback (every 3s)
            const interval = setInterval(fetchHistory, 3000);
            return () => clearInterval(interval);

        } else {
            setMessages([]);
            setCareTeam([{ name: user.name, role: user.role, active: true, isSelf: true }]);
        }
    }, [selectedPatientId, user]);

    // ... (Scroll handling remains) ...
    const scrollToBottom = (behavior = "smooth") => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
        }
    };

    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages]);

    const handleImageLoad = () => {
        scrollToBottom();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment({
                name: file.name,
                type: file.type,
                data: reader.result,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async () => {
        if (!message.trim() && !attachment) return;

        // 1. Construct Message Object (UI optimistic version)
        const tempId = Date.now().toString();
        const newMessageUI = {
            id: tempId,
            sender: user.name,
            role: user.role,
            text: message,
            attachment: attachment,
            patientId: selectedPatientId,
            timestamp: new Date().toISOString()
        };

        // 0. Optimistic Update
        setMessages(prev => [...prev, newMessageUI]);
        setTimeout(() => scrollToBottom(), 100);

        try {
            // 1. Persist to DB (FILE SYSTEM NOW)
            // Pass Sender Info explicitly for the file storage
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.id || 'MOCK_ID',
                    senderName: user.name,
                    role: user.role,
                    recipientId: selectedPatientId,
                    recipientName: 'Patient',
                    content: message,
                    type: 'CHAT'
                })
            });

            if (!res.ok) {
                console.error("Failed to save message");
            }

            // 2. Emit to Socket
            if (socket) {
                // Ensure socket message has needed fields for peers to update their Care Team list
                socket.emit('send_message', {
                    ...newMessageUI,
                    senderName: user.name, // compatibility
                    role: user.role
                });
            }
        } catch (e) {
            console.error("Error sending message", e);
        }

        setMessage('');
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ... (Delete/Keypress/RenderAttachment remain) ...
    const handleDelete = (id) => {
        if (confirm('Delete this message locally? (Server sync pending)')) {
            setMessages(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const renderAttachment = (att) => {
        if (!att) return null;
        if (att.type.startsWith('image/')) {
            return (
                <div className="mt-2">
                    <img
                        src={att.data}
                        alt={att.name}
                        onLoad={handleImageLoad}
                        className="chat-attachment-img"
                        onClick={() => window.open(att.data)}
                    />
                </div>
            );
        }
        if (att.type.startsWith('video/')) {
            return (
                <div className="mt-2">
                    <video controls className="chat-attachment-video">
                        <source src={att.data} type={att.type} />
                    </video>
                </div>
            );
        }
        return (
            <div className="chat-attachment-file" onClick={() => window.open(att.data)}>
                <span className="file-icon">{att.type === 'application/pdf' ? '📄' : '📎'}</span>
                <div className="file-info">
                    <div className="file-name">{att.name}</div>
                    <div className="file-meta">{att.size}</div>
                </div>
            </div>
        );
    };

    // Care Team is now DYNAMIC 'careTeam' state, not hardcoded.

    return (
        <Card className="collaboration-card">
            {/* Care Team Sidebar */}
            <div className="collab-sidebar">
                <h4 className="collab-section-title">Care Team</h4>
                <div className="care-team-list">
                    {careTeam.length === 0 && <p className="text-xs text-slate-400 p-2">Wait for activity...</p>}
                    {careTeam.map((member, idx) => (
                        <div key={idx} className={`care-team-item ${member.isSelf ? 'self' : ''}`}>
                            <div className="care-team-avatar-wrapper">
                                <div className="care-team-avatar">
                                    {member.name.charAt(0)}
                                </div>
                                <div className={`care-team-status ${member.active ? 'active' : ''}`}></div>
                            </div>
                            <div>
                                <div className="font-bold text-sm">{member.name} {member.isSelf && '(You)'}</div>
                                <div className="text-xs text-slate-500">{member.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto pt-4 text-xs text-slate-400 text-center">
                    {isConnected ? '🟢 Live Connection' : '🔴 Reconnecting...'}
                </div>
            </div>

            {/* Chat Space */}
            <div className="chat-area">
                <div className="chat-messages" ref={scrollContainerRef}>
                    {messages.length === 0 ? (
                        <div className="chat-empty-state">
                            <div className="text-3xl mb-4">💬</div>
                            <p>No messages in this session. Start the clinical discussion.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isSelf = msg.sender === user.name;
                            return (
                                <div key={msg.id} className={`chat-msg-container ${isSelf ? 'self' : ''}`}>
                                    <div className="chat-msg-header">
                                        <span>{msg.sender} • {msg.role}</span>
                                        {isSelf && (
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="chat-delete-btn"
                                                title="Delete Message"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                    <div className="chat-msg-bubble">
                                        {msg.text}
                                        {renderAttachment(msg.attachment)}
                                    </div>
                                    <div className="chat-timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    {attachment && (
                        <div className="attachment-preview">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{attachment.type.startsWith('image/') ? '🖼️' : attachment.type.startsWith('video/') ? '🎥' : '📄'}</span>
                                <span className="text-sm font-bold">{attachment.name} ({attachment.size})</span>
                            </div>
                            <button onClick={() => setAttachment(null)} className="attachment-close-btn">✕</button>
                        </div>
                    )}
                    <div className="chat-controls">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/*,video/*,application/pdf"
                        />
                        <Button
                            variant="secondary"
                            className="px-2 text-xl rounded-lg"
                            onClick={() => fileInputRef.current.click()}
                            title="Attach Image, PDF, or Video"
                        >
                            📎
                        </Button>
                        <Input
                            type="text"
                            placeholder="Share clinical insights or ask the team..."
                            className="m-0 rounded-lg h-auto"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            fullWidth
                        />
                        <Button
                            variant="primary"
                            className="px-6 rounded-lg"
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                    </div>
                    <p className="chat-helper-text">Supports: Images, PDF documents, and MP4 videos.</p>
                </div>
            </div>
        </Card>
    );
}
