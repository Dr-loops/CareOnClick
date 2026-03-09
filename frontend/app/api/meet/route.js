import { NextResponse } from 'next/server';
// import { createMeetEvent } from '@/lib/googleMeet';

export async function POST(req) {
    try {
        const body = await req.json();
        const { topic, startTime, attendees } = body;

        // The user requested to always use this specific static link:
        return NextResponse.json({
            link: "https://meet.google.com/oew-uyne-rbb",
            mock: true
        });

    } catch (error) {
        console.error("Meet Creation Failed:", error);
        return NextResponse.json({
            link: "https://meet.google.com/oew-uyne-rbb",
            error: error.message
        }, { status: 500 });
    }
}
