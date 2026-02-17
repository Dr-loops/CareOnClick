/**
 * VideoCallService
 * Centralizes logic for initiating video calls via different providers (Meet, WhatsApp)
 */

export const VIDEO_METHODS = {
    MEET: 'meet',
    WHATSAPP: 'whatsapp',
    AUTO: 'auto'
};

export const VideoCallService = {
    /**
     * Determines the best method based on preference and availability
     * @param {Object} userPreference - User's preferred method
     * @param {String} targetWhatsapp - Target user's WhatsApp number (if any)
     * @returns {String} 'meet' or 'whatsapp'
     */
    determineMethod: (userPreference, targetWhatsapp) => {
        if (userPreference === VIDEO_METHODS.WHATSAPP && targetWhatsapp) {
            return VIDEO_METHODS.WHATSAPP;
        }
        if (userPreference === VIDEO_METHODS.MEET) {
            return VIDEO_METHODS.MEET;
        }
        // Auto logic: Prefer WhatsApp if number exists, else Meet
        if (userPreference === VIDEO_METHODS.AUTO) {
            return targetWhatsapp ? VIDEO_METHODS.WHATSAPP : VIDEO_METHODS.MEET;
        }
        return VIDEO_METHODS.MEET; // Default fallback
    },

    /**
     * Initiates a Google Meet session 
     * @returns {Promise<String>} Meet Link
     */
    startMeetSession: async () => {
        try {
            console.log("Calling /api/meet...");
            const res = await fetch('/api/meet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: 'Consultation',
                    startTime: new Date().toISOString()
                })
            });
            const data = await res.json();
            return data.link || "https://meet.google.com/landing";
        } catch (e) {
            console.error("Failed to create meet:", e);
            return "https://meet.google.com/new"; // Fallback
        }
    },

    /**
     * Generates a WhatsApp deep link
     * @param {String} number - E.164 formatted number
     * @returns {String} Deep link
     */
    getWhatsAppLink: (number) => {
        if (!number) return null;
        // Basic cleaning
        const cleanNum = number.replace(/[^\d+]/g, '');
        return `https://wa.me/${cleanNum}`;
    },

    /**
     * Unified call initiation
     * @param {String} method - 'meet' or 'whatsapp'
     * @param {Object} targetUser - The user being called
     * @param {String} senderName - Name of the person initiating
     */
    startCall: async (method, targetUser, senderName) => {
        const { getSocket } = require('@/lib/socket');
        const socket = getSocket();

        if (method === VIDEO_METHODS.MEET) {
            // Open placeholder immediately to bypass popup blockers
            const newWindow = window.open('about:blank', '_blank');
            if (newWindow) newWindow.document.write('Initializing Google Meet...');

            try {
                const link = await VideoCallService.startMeetSession();
                if (newWindow) {
                    newWindow.location.href = link;
                } else {
                    window.open(link, '_blank');
                }

                // Notify Patient via Socket
                if (socket && targetUser?.id) {
                    socket.emit('send_notification', {
                        recipientId: targetUser.id,
                        type: 'VIDEO_CALL_STARTED',
                        title: 'Video Consultation Started',
                        message: `${senderName} has started a video consultation. Click to join.`,
                        metadata: { link, action: 'JOIN_CALL' }
                    });
                }
            } catch (e) {
                console.error("Meet failed:", e);
                if (newWindow) newWindow.close();
                alert("Failed to start Google Meet. Please try again.");
            }
        } else if (method === VIDEO_METHODS.WHATSAPP) {
            const number = targetUser?.whatsappNumber || targetUser?.phoneNumber;
            if (!number) {
                alert("This user does not have a registered phone number for WhatsApp.");
                return;
            }

            const link = VideoCallService.getWhatsAppLink(number);
            if (link) window.open(link, '_blank');

            // Optional: Notify via socket too
            if (socket && targetUser?.id) {
                socket.emit('send_notification', {
                    recipientId: targetUser.id,
                    type: 'WHATSAPP_CALL_STARTED',
                    title: 'WhatsApp Consultation',
                    message: `${senderName} is initiating a WhatsApp consultation.`,
                });
            }
        }
    }
};
