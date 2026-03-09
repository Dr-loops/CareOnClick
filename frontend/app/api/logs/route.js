import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * POST /api/logs
 * Writes an audit log entry directly to the database.
 * This is more reliable than the client-side logAudit() which depends on localStorage + syncToServer.
 */
export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            actorId,
            actorName,
            action,
            target,
            targetName,
            details,
            notes,
            location
        } = body;

        if (!action) {
            return NextResponse.json({ error: 'action is required' }, { status: 400 });
        }

        const log = await prisma.auditLog.create({
            data: {
                actorId: actorId || session.user.id,
                actorName: actorName || session.user.name || 'Unknown',
                action,
                target: target || targetName || 'System',
                details: details || notes || location || '',
                timestamp: new Date(),
            }
        });

        return NextResponse.json({ success: true, log });
    } catch (error) {
        console.error('[API/LOGS] Error saving audit log:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/logs
 * Returns recent audit logs (admin only).
 */
export async function GET(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const actorId = searchParams.get('actorId');

        const logs = await prisma.auditLog.findMany({
            where: actorId ? { actorId } : {},
            orderBy: { timestamp: 'desc' },
            take: Math.min(limit, 500), // Cap at 500 for safety
        });

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('[API/LOGS] Error fetching audit logs:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
