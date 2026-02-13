const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(id) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: { id: true, email: true, role: true, verificationStatus: true }
        });
        console.log('User found:', user);
    } catch (error) {
        console.error('Error fetching user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const userId = process.argv[2];
if (!userId) {
    console.log('Please provide a user ID as an argument.');
} else {
    checkUser(userId);
}
