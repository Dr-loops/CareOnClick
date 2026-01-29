const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

async function createAdminViaAPI() {
    console.log('🔨 Creating admin user via registration API...\n');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hospital.com',
                password: 'admin123',
                name: 'System Administrator',
                role: 'admin',
                adminSecret: 'DR_KAL_SECURE_ADMIN_2026'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Admin user created successfully!\n');
            console.log('═══════════════════════════════════════');
            console.log('📧 LOGIN CREDENTIALS:');
            console.log('   Email: admin@hospital.com');
            console.log('   Password: admin123');
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('⚠️  Response:', data);
            if (data.error && data.error.includes('unique')) {
                console.log('\n✅ Admin user likely already exists!');
                console.log('   Try logging in with: admin@hospital.com');
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the frontend server is running (npm run frontend)');
    }
}

createAdminViaAPI();
