const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?schema=public&sslmode=require&pgbouncer=true"
        }
    }
});

async function check() {
    const users = [
        { email: "drkalsvirtualhospital@gmail.com", onlinePass: "DrKal@Secure2026" },
        { email: "jfrytol22@gmail.com", onlinePass: "123456" }
    ];

    console.log('--- SUPABASE CHECK ---');
    for (const u of users) {
        const dbUser = await prisma.user.findUnique({ where: { email: u.email } });
        if (dbUser) {
            const match = await bcrypt.compare(u.onlinePass, dbUser.password);
            console.log(`User: ${u.email}`);
            console.log(`Does Online Password match Supabase DB? ${match}`);
        } else {
            console.log(`User ${u.email} NOT FOUND in Supabase`);
        }
    }
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
