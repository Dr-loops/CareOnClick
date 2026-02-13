const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countStatuses() {
    try {
        const counts = await prisma.user.groupBy({
            by: ['verificationStatus', 'role'],
            _count: {
                _all: true
            }
        });
        console.log('User counts by status:', counts);
    } catch (error) {
        console.error('Error counting users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

countStatuses();
