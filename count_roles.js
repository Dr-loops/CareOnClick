const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countRoles() {
    const users = await prisma.user.findMany({
        select: { role: true }
    });

    const roleMap = {};
    users.forEach(u => {
        const r = u.role || 'NULL';
        roleMap[r] = (roleMap[r] || 0) + 1;
    });

    console.log('--- ROLE DISTRIBUTION ---');
    Object.entries(roleMap).forEach(([role, count]) => {
        console.log(`${role}: ${count}`);
    });
}

countRoles().catch(e => console.error(e)).finally(() => prisma.$disconnect());
