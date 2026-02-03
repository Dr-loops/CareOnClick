const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to DB...");
        const users = await prisma.user.findMany();
        console.log("Total Users:", users.length);

        if (users.length === 0) {
            console.log("NO USERS FOUND!");
        } else {
            users.forEach(u => {
                console.log(`User: ${u.email} | Role: ${u.role} | PwdHash: ${u.password ? u.password.substring(0, 15) + '...' : 'NULL'}`);
            });
        }
    } catch (e) {
        console.error("Error querying DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
