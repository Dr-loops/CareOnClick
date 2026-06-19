import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import twilio from 'twilio';

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
} = process.env;

/**
 * POST /api/twilio-video
 * Generates a Twilio Access Token with a Video Grant for the requesting user.
 * Body: { roomName: string }
 * Returns: { token: string, roomName: string }
 */
export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomName } = await req.json();
        if (!roomName) {
            return NextResponse.json({ error: 'roomName is required' }, { status: 400 });
        }

        // Validate env vars
        if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET) {
            console.error('[Twilio Video] Missing env vars: TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, or TWILIO_API_KEY_SECRET');
            return NextResponse.json({ error: 'Twilio Video not configured' }, { status: 500 });
        }

        // Create an Access Token
        const AccessToken = twilio.jwt.AccessToken;
        const VideoGrant = AccessToken.VideoGrant;

        const token = new AccessToken(
            TWILIO_ACCOUNT_SID,
            TWILIO_API_KEY_SID,
            TWILIO_API_KEY_SECRET,
            {
                identity: `${session.user.name || session.user.id}-${Math.floor(Math.random() * 10000)}`,
                ttl: 3600, // 1 hour
            }
        );

        // Grant access to the Video room
        const videoGrant = new VideoGrant({ room: roomName });
        token.addGrant(videoGrant);

        console.log(`[Twilio Video] Token generated for ${session.user.name} in room ${roomName}`);

        return NextResponse.json({
            token: token.toJwt(),
            roomName,
            identity: session.user.name || session.user.id,
        });
    } catch (error) {
        console.error('[Twilio Video] Token generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
