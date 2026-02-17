const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin(emailOrId, password) {
    const trimmedInput = emailOrId.trim();
    const lowerInput = trimmedInput.toLowerCase();
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: lowerInput },
                { email: trimmedInput },
                { id: trimmedInput },
                { pathNumber: trimmedInput }
            ]
        }
    });

    if (!user) {
        console.log(`❌ User NOT FOUND for: "${emailOrId}"`);
        return;
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    console.log(`User: ${user.email} (Role: ${user.role}), Password: ${password}, Match: ${passwordsMatch}`);
}

async function main() {
    console.log('--- TESTING LOGIN LOGIC ---');
    await testLogin('drkalsvirtualhospital@gmail.com', 'DrKal@Secure2026');
    await testLogin('jfrytol22@gmail.com', '123456');
    console.log('--- END TEST ---');
}

main().finally(() => prisma.$disconnect());
