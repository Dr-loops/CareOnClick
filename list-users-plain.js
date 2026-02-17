const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                name: true
            }
        });

        console.log("Registered Users List:");
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
