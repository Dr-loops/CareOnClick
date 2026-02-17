import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request) {
    try {
        const session = await auth();
        // Even if session is fading, we might still have user info. 
        // If not, we log as Anonymous or try to get info from body if sent (but body is less secure for identity).
        // Best effort: rely on session.

        let actorId = 'Anonymous';
        let actorName = 'Unknown';

        if (session && session.user) {
            actorId = session.user.id || session.user.email;
            actorName = session.user.name || session.user.email;
        }

        await prisma.auditLog.create({
            data: {
                action: 'LOGOUT',
                actorId: actorId,
                actorName: actorName,
                target: 'System',
                details: 'User initiated logout',
                timestamp: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout Log Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
