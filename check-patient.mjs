import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'patient@drkal.com';
    const u = await prisma.user.findUnique({ where: { email } });

    if (u) {
        console.log(`User: ${u.email} [Role: ${u.role}]`);
        console.log(`Hash in DB: ${u.password.substring(0, 10)}...`);
        const isMatch = await bcrypt.compare('password', u.password);
        console.log(`Password 'password' valid? ${isMatch}`);
    } else {
        console.log("User not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
