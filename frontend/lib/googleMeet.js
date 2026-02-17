import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

/**
 * Initializes the Google Calendar API client
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var or a key file path
 */
const getCalendarClient = async () => {
    try {
        // In a real env, we'd use process.env.GOOGLE_APPLICATION_CREDENTIALS or similar
        // For this implementation, we expect the credentials to be in the env vars
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix newlines
            },
            scopes: SCOPES,
        });

        return google.calendar({ version: 'v3', auth });
    } catch (error) {
        console.error("Google Auth Error:", error);
        return null;
    }
};

/**
 * Creates a Google Meet event
 * @param {string} summary - Event title
 * @param {string} description - Event description
 * @param {string} startTime - ISO date string
 * @param {string} endTime - ISO date string
 * @param {string[]} attendees - Array of email addresses
 */
export const createMeetEvent = async (summary, description, startTime, endTime, attendees = []) => {
    const calendar = await getCalendarClient();

    if (!calendar) {
        throw new Error("Could not authenticate with Google.");
    }

    const event = {
        summary,
        description,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
        attendees: attendees.map(email => ({ email })),
        conferenceData: {
            createRequest: { requestId: Math.random().toString(36).substring(7) },
        },
    };

    try {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });

        return {
            link: res.data.hangoutLink,
            id: res.data.id,
            htmlLink: res.data.htmlLink
        };
    } catch (err) {
        console.error("Calendar API Error:", err);
        throw err;
    }
};
