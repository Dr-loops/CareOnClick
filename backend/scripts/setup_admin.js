const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for existing admin user...\n');

    // Check for existing admin
    const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true, email: true, name: true, role: true }
    });

    console.log(`Found ${admins.length} admin user(s):\n`);
    admins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email})`);
    });

    if (admins.length > 0) {
        console.log('\n✅ Admin user(s) already exist. If you need to reset password, delete them first.\n');
        console.log('📝 You can login with:');
        console.log('   Email: ' + admins[0].email);
        console.log('   Password: <check with system administrator>\n');
        return;
    }

    console.log('\n🔨 Creating new admin user...\n');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const newAdmin = await prisma.user.create({
        data: {
            email: 'admin@hospital.com',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'admin',
            verificationStatus: 'Verified',
            phoneNumber: '+233540509530'
        }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 LOGIN CREDENTIALS:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: admin123');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Change password after first login!\n');
}

main()
    .catch(e => {
        console.error('❌ Error:', e.message);
        console.error('\nFull error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
