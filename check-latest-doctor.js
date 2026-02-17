const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestDoctor() {
    try {
        const user = await prisma.user.findFirst({
            where: { role: 'doctor' },
            orderBy: { createdAt: 'desc' },
            select: { id: true, email: true, role: true, verificationStatus: true, createdAt: true }
        });
        console.log('VERIFICATION_STATUS:', user ? user.verificationStatus : 'No user found');
    } catch (error) {
        console.error('Error fetching user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestDoctor();
