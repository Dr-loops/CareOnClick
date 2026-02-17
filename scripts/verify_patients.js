const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Verifying Test Patients...");
    const users = await prisma.user.findMany({
        where: {
            pathNumber: {
                in: Array.from({ length: 12 }, (_, i) => `PATH${(i + 1).toString().padStart(4, '0')}`)
            }
        },
        select: {
            pathNumber: true,
            email: true,
            name: true
        },
        orderBy: {
            pathNumber: 'asc'
        }
    });

    console.log("Found Users:");
    users.forEach(u => console.log(`${u.pathNumber} | ${u.email} | ${u.name}`));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
