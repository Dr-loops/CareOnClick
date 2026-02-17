const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Corrected URL: %40 is @. The user's %4true was almost certainly a typo.
const DATABASE_URL = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?schema=public&sslmode=require&pgbouncer=true";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

async function testConnection() {
    console.log('Testing connection to Supabase with corrected URL...');
    try {
        const count = await prisma.user.count();
        console.log(`✅ Success! Total users: ${count}`);

        const admin = await prisma.user.findUnique({
            where: { email: 'drkalsvirtualhospital@gmail.com' }
        });

        if (admin) {
            console.log(`✅ Admin found. Current role: ${admin.role}`);
            const match = await bcrypt.compare('DrKal@Secure2026', admin.password);
            console.log(`Password 'DrKal@Secure2026' match? ${match}`);
        } else {
            console.log('❌ Admin not found in Supabase.');
        }

    } catch (e) {
        console.error('❌ Connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
