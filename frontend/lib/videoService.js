/**
 * VideoCallService
 * Centralizes logic for initiating video calls via different providers (Twilio, WhatsApp)
 */

export const VIDEO_METHODS = {
    TWILIO: 'twilio',
    WHATSAPP: 'whatsapp',
    AUTO: 'auto'
};

export const VideoCallService = {
    /**
     * Determines the best method based on preference and availability
     * @param {string} userPreference - User's preferred method
     * @param {string} targetWhatsapp - Target user's WhatsApp number (if any)
     * @returns {string} 'twilio' or 'whatsapp'
     */
    determineMethod: (userPreference, targetWhatsapp) => {
        if (userPreference === VIDEO_METHODS.WHATSAPP && targetWhatsapp) {
            return VIDEO_METHODS.WHATSAPP;
        }
        if (userPreference === VIDEO_METHODS.TWILIO) {
            return VIDEO_METHODS.TWILIO;
        }
        // Auto logic: Default to Twilio for professional consultations
        return VIDEO_METHODS.TWILIO;
    },

    /**
     * Generates a deterministic room name from two user IDs
     * Ensures both users always get the same room name regardless of who initiates
     * @param {string} userId1
     * @param {string} userId2
     * @returns {string} Room name
     */
    getRoomName: (userId1, userId2) => {
        const sorted = [userId1, userId2].sort();
        return `consult-${sorted[0].slice(-6)}-${sorted[1].slice(-6)}`;
    },

    /**
     * Generates a WhatsApp deep link
     * @param {string} number - E.164 formatted number
     * @returns {string|null} Deep link
     */
    getWhatsAppLink: (number) => {
        if (!number) return null;
        // Basic cleaning
        const cleanNum = number.replace(/[^\d+]/g, '');
        return `https://wa.me/${cleanNum}`;
    }
};
