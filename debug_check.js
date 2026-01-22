
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    console.log("--- Checking Users ---");
    const users = await prisma.user.findMany({
        where: { email: { contains: 'test' } },
        select: { id: true, email: true, role: true }
    });
    console.log("Found users:", users);

    console.log("\n--- Testing Upload API ---");
    // We cannot easily test Next.js API route from node script without fetch to running server
    // Assuming server is at localhost:3000
    try {
        const formData = new FormData();
        const blob = new Blob(["Test file content"], { type: "text/plain" });
        formData.append('file', blob, 'debug_test.txt');

        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        console.log("Upload Status:", res.status);
        console.log("Upload Response:", data);
    } catch (e) {
        console.error("Upload Test Failed:", e.message);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
