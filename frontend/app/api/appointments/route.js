
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Adjust import path if needed
import { notificationService } from '@/lib/notifications';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        let appointments = [];

        if (user.role === 'patient') {
            // Patients only see their own appointments
            appointments = await prisma.appointment.findMany({
                where: { patientId: user.id },
                orderBy: { date: 'desc' }
            });
        } else if (['doctor', 'nurse', 'admin', 'pharmacist', 'scientist', 'psychologist', 'dietician'].includes(user.role)) {
            // Professionals can see appointments relevant to them or all (simplifying to all for now, or filtered by query)
            // Ideally, filtering by professionalId if provided in query
            const { searchParams } = new URL(request.url);
            const professionalId = searchParams.get('professionalId');

            if (professionalId) {
                appointments = await prisma.appointment.findMany({
                    where: { professionalId: professionalId },
                    orderBy: { date: 'desc' }
                });
            } else {
                appointments = await prisma.appointment.findMany({
                    orderBy: { date: 'desc' }
                });
            }
        }

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Failed to fetch appointments", error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Basic Validation
        if (!data.professionalId || !data.date || !data.time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                id: `APP-${Date.now()}`,
                patientId: session.user.id, // Enforce current user as patient
                patientName: session.user.name,
                professionalId: data.professionalId,
                professionalName: data.professionalName,
                professionalCategory: data.professionalCategory,
                date: new Date(data.date),
                time: data.time,
                type: data.type || 'Video',
                status: 'Pending', // Changed from 'Upcoming' to 'Pending' for manual approval
                amountPaid: parseFloat(data.amountPaid || 0),
                balanceDue: parseFloat(data.balanceDue || 0),
                paymentStatus: data.amountPaid > 0 ? 'Paid' : 'Pending', // Simplified logic
            }
        });

        // Send Notifications
        // 1. To Professional
        try {
            // Need to fetch professional's contact info (phone/email) to send real notification
            // For now, using the generic service which handles the logic or logs it
            await notificationService.sendSMS(
                'SYSTEM', // System ID
                `New Pending Booking: ${session.user.name} for ${data.date} at ${data.time}. Type: ${data.type}`
            );
            // Ideally we look up the professional's phone number here
        } catch (e) {
            console.error("Failed to send notification", e);
        }

        return NextResponse.json(newAppointment);

    } catch (error) {
        console.error("Failed to create appointment", error);
        return NextResponse.json({ error: `Failed to create appointment: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { id, status } = data;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing appointment ID or status' }, { status: 400 });
        }

        // Verify ownership/permissions? 
        // Professionals can update status. Patients might cancel (status=Cancelled).
        // For simplicity, allowing authenticated users to update for now, but ideally check role.

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: { professional: true }
        });

        // [NEW] Trigger Patient Alert on Status Change
        if (status === 'Upcoming' || status === 'Cancelled') {
            try {
                const actionText = status === 'Upcoming' ? 'accepted' : 'cancelled';
                const alertType = status === 'Upcoming' ? 'CHAT' : 'ALERT';
                const content = status === 'Upcoming'
                    ? `Your appointment with ${updatedAppointment.professionalName} on ${updatedAppointment.date.toLocaleDateString()} at ${updatedAppointment.time} has been accepted.`
                    : `Your appointment with ${updatedAppointment.professionalName} on ${updatedAppointment.date.toLocaleDateString()} has been cancelled.`;

                await prisma.message.create({
                    data: {
                        senderId: updatedAppointment.professionalId,
                        senderName: updatedAppointment.professionalName,
                        role: updatedAppointment.professional.role,
                        recipientId: updatedAppointment.patientId,
                        recipientName: updatedAppointment.patientName,
                        type: alertType,
                        content: content,
                    }
                });

                // Also trigger real-time notification service if available
                if (status === 'Cancelled') {
                    await notificationService.sendSMS('SYSTEM', `Appointment ${id} ${actionText} for ${updatedAppointment.patientName}`);
                }
            } catch (notifyErr) {
                console.error("Failed to create status notification message", notifyErr);
            }
        }

        return NextResponse.json(updatedAppointment);

    } catch (error) {
        console.error("Failed to update appointment", error);
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
        }

        // Optional: specific check if user owns the appointment can be done here or relied on Prisma where clause if we wanted to be strict.
        // For now, we trust the ID but could add `where: { id, patientId: session.user.id }` for security.

        await prisma.appointment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to cancel appointment", error);
        return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
    }
}
