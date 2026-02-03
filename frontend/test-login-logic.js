const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function authorize(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log("User not found");
        return null;
    }
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}

async function run() {
    const user = await authorize('admin@drkal.com', 'admin123');
    if (user) {
        console.log("SIMULATION SUCCESS: User logged in as", user.role);
    } else {
        console.log("SIMULATION FAILED: Invalid credentials");
    }
    await prisma.$disconnect();
}

run();
