import React from 'react';
import { Video, Phone, X } from 'lucide-react';
import { VideoCallService, VIDEO_METHODS } from '@/lib/videoService';

const VideoMethodModal = ({ isOpen, onClose, onSelectMethod }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">Start Video Consultation</h3>
                        <p className="text-blue-100 text-sm mt-1">Choose your preferred platform</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <button
                        onClick={() => onSelectMethod(VIDEO_METHODS.MEET)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Video size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-800">Google Meet</h4>
                            <p className="text-sm text-slate-500">Secure, professional video conferencing</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectMethod(VIDEO_METHODS.WHATSAPP)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Phone size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-800">WhatsApp Video</h4>
                            <p className="text-sm text-slate-500">Quick and easy mobile connection</p>
                        </div>
                    </button>
                </div>

                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400">
                    Both parties will receive the connection link immediately.
                </div>
            </div>
        </div>
    );
};

export default VideoMethodModal;
