const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const u1 = await prisma.user.findUnique({ where: { email: 'admin@drkal.com' } });
    const u2 = await prisma.user.findUnique({ where: { email: 'admin@hospital.com' } });
    console.log("admin@drkal.com:", u1 ? "EXISTS" : "MISSING");
    console.log("admin@hospital.com:", u2 ? "EXISTS" : "MISSING");
    await prisma.$disconnect();
}
main();
