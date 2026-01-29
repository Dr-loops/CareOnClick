import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        console.log("DEBUG: Received Profile Update Payload. Size:", JSON.stringify(data).length);

        // Fields allowed to be updated
        const { name, phoneNumber, whatsappNumber, bio, avatarUrl, licenseNumber, yearsOfExperience, currentFacility, country, region, specialization, password } = data;

        const updateData = {
            name,
            phoneNumber,
            whatsappNumber,
            bio,
            avatarUrl,
            licenseNumber,
            yearsOfExperience: (yearsOfExperience !== '' && yearsOfExperience !== null && yearsOfExperience !== undefined) ? parseInt(yearsOfExperience) : undefined,
            currentFacility,
            country,
            region,
            specialization
        };

        // If password is provided, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("DEBUG: Profile Update Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
    }
}
