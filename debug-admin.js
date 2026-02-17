const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'admin@drkal.com';
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log("Admin user not found!");
            return;
        }

        console.log("Testing password 'admin123' for", email);
        const match = await bcrypt.compare('admin123', user.password);
        console.log("Match Result:", match);

        if (!match) {
            console.log("Trying 'admin1234'...");
            const match2 = await bcrypt.compare('admin1234', user.password);
            console.log("Match Result 2:", match2);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
