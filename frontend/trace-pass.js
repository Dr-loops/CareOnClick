const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
    const users = [
        { email: "drkalsvirtualhospital@gmail.com", onlinePass: "DrKal@Secure2026" },
        { email: "jfrytol22@gmail.com", onlinePass: "123456" }
    ];

    for (const u of users) {
        const dbUser = await prisma.user.findUnique({ where: { email: u.email } });
        if (dbUser) {
            const match = await bcrypt.compare(u.onlinePass, dbUser.password);
            console.log(`User: ${u.email}`);
            console.log(`DB Password Hash: ${dbUser.password}`);
            console.log(`Does Online Password match DB? ${match}`);
        } else {
            console.log(`User ${u.email} NOT FOUND`);
        }
    }
}

check().finally(() => prisma.$disconnect());
