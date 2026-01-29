
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, role: true }
    });

    console.log('--- USERS LIST ---');
    users.forEach(u => console.log(`${u.id} | ${u.name} | ${u.role}`));

    const felix = users.find(u => u.name && u.name.includes('Felix'));
    if (felix) {
        console.log('\nFOUND FELIX:', felix);
    } else {
        console.log('\nFELIX NOT FOUND IN DB');
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
