import { NextResponse } from 'next/server';
import { createMeetEvent } from '@/lib/googleMeet';

export async function POST(req) {
    try {
        const body = await req.json();
        const { topic, startTime, attendees } = body;

        // Default to one hour from now if not provided
        const start = startTime ? new Date(startTime) : new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

        // Mock Fallback if no credentials (so the UI doesn't break for the user immediately)
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn("Missing Google Credentials. Returning Mock Link.");
            return NextResponse.json({
                link: "https://meet.google.com/mock-meet-link-" + Math.random().toString(36).substring(7),
                mock: true
            });
        }

        const result = await createMeetEvent(
            topic || "Dr. Kal's Virtual Consultation",
            "Video consultation via Google Meet",
            start.toISOString(),
            end.toISOString(),
            attendees || []
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("Meet Creation Failed:", error);
        // Fallback for demo purposes if API fails
        return NextResponse.json({
            link: "https://meet.google.com/error-fallback",
            error: error.message
        }, { status: 500 }); // Or 200 with error flag to keep UI flowing
    }
}
