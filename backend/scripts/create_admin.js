const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'admin' }
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:');
            console.log('   Email:', existingAdmin.email);
            console.log('   Name:', existingAdmin.name);
            console.log('\n📝 To reset password, delete the user and run this script again.');
            return;
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@hospital.com',
                password: hashedPassword,
                name: 'System Administrator',
                role: 'admin',
                verificationStatus: 'Verified',
                phoneNumber: '+233540509530',
                address: 'Hospital Administration Office'
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('   Email: admin@hospital.com');
        console.log('   Password: admin123');
        console.log('\n⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
