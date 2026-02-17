
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        let records = [];

        if (user.role === 'patient') {
            // Find records where patientId matches the user ID 
            // OR where pathNumber matches (handling legacy mock IDs if necessary, but we are enforcing real data now)
            records = await prisma.medicalRecord.findMany({
                where: {
                    OR: [
                        { patientId: user.id },
                        { patientId: user.pathNumber || 'N/A' } // Fallback if pathNumber is used
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Professionals can fetch records. 
            // If they provide a patientId query param, filter by it.
            const { searchParams } = new URL(request.url);
            const patientId = searchParams.get('patientId');

            if (patientId) {
                records = await prisma.medicalRecord.findMany({
                    where: { patientId: patientId },
                    orderBy: { createdAt: 'desc' }
                });

                // AUDIT LOG: Professional Viewed Patient Records
                try {
                    // Only log if records were found or intent was clear
                    await prisma.auditLog.create({
                        data: {
                            action: 'VIEW_RECORDS',
                            actorId: user.id || user.email,
                            actorName: user.name || user.email,
                            target: `Patient:${patientId}`,
                            details: `Professional viewed medical records of patient ${patientId}`,
                            timestamp: new Date()
                        }
                    });
                } catch (logErr) { console.error("Audit Log Record View Error", logErr); }
            } else {
                // If no filter, maybe return records *created by* this professional?
                // Or return empty to avoid dumping huge list?
                // Let's return recent records created by them for "My Work" view
                records = await prisma.medicalRecord.findMany({
                    where: { professionalId: user.id },
                    orderBy: { createdAt: 'desc' }
                });
            }
        }

        return NextResponse.json(records);
    } catch (error) {
        console.error("Failed to fetch records", error);
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only professionals can create records
        if (session.user.role === 'patient') {
            return NextResponse.json({ error: 'Patients cannot create clinical records' }, { status: 403 });
        }

        const data = await request.json();

        // Validate
        if (!data.patientId || !data.fileName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newRecord = await prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                patientName: data.patientName || 'Unknown',
                professionalId: session.user.id,
                professionalName: session.user.name,
                professionalRole: session.user.role.toUpperCase(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                fileName: data.fileName,
                fileType: data.fileType || 'application/json',
                fileUrl: data.fileUrl || null,
                unit: data.unit || 'General',
                structuredData: data.structuredResults ? JSON.stringify(data.structuredResults) : null
            }
        });

        // Trigger Notification to Patient
        // We'll leave this for the NotificationService if we want to expand it later.
        // For now, it's just stored.

        return NextResponse.json(newRecord);

        console.error("Failed to create record", error);
    } catch (error) {
        console.error("Failed to create record", error);
        return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only professionals can delete records (or Admin)
        if (session.user.role === 'patient') {
            return NextResponse.json({ error: 'Patients cannot delete clinical records' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
        }

        // Verify record exists and user has permission (e.g., created it or is admin)
        // For simplicity in this demo, any professional can delete any record, 
        // but in prod you'd check `professionalId` or Admin role.

        await prisma.medicalRecord.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Failed to delete record", error);
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }
}
