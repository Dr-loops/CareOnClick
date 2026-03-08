const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'drkalsvirtualhospital@gmail.com';
    try {
        console.log(`--- Checking for User: ${targetEmail} ---`);
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: targetEmail },
                    { email: targetEmail.toLowerCase() }
                ]
            }
        });

        if (user) {
            console.log('USER_FOUND: YES');
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`VerificationStatus: ${user.verificationStatus}`);
            console.log(`PasswordHash: ${user.password.substring(0, 10)}...`);
        } else {
            console.log('USER_FOUND: NO');
            
            // Check for similar emails or just list all admins again
            const allAdmins = await prisma.user.findMany({
                where: { role: 'admin' },
                select: { email: true, role: true, verificationStatus: true }
            });
            console.log('ALL_CURRENT_ADMINS:');
            allAdmins.forEach(a => console.log(`- ${a.email} [${a.role}] (${a.verificationStatus})`));
        }
    } catch (err) {
        console.error('DB_ERROR:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
