import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
        }

        // Fetch user from DB to get hashed password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'PASSWORD_CHANGE',
                actorId: user.id,
                actorName: user.name,
                details: 'User successfully changed their password.',
                timestamp: new Date()
            }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error("Password Change Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
