// Quick admin user checker
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'prisma', 'dev.db');

try {
    const db = sqlite3(dbPath, { readonly: false });

    console.log('🔍 Checking for admin users...\n');

    // Check existing admins
    const admins = db.prepare('SELECT id, email, name, role FROM User WHERE role = ?').all('admin');

    console.log(`Found ${admins.length} admin user(s):\n`);
    admins.forEach(admin => {
        console.log(`  ✓ ${admin.name} (${admin.email})`);
    });

    if (admins.length > 0) {
        console.log('\n✅ Admin user exists! Try these credentials:');
        console.log('   Email:', admins[0].email);
        console.log('   Password: Try common passwords or contact system administrator\n');
    } else {
        console.log('\n🔨 Creating admin user...\n');

        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const stmt = db.prepare(`
            INSERT INTO User (id, email, password, name, role, verificationStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        const adminId = 'admin_' + Date.now();

        stmt.run(adminId, 'admin@hospital.com', hashedPassword, 'System Administrator', 'admin', 'Verified', now, now);

        console.log('✅ Admin user created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('📧 LOGIN CREDENTIALS:');
        console.log('   Email: admin@hospital.com');
        console.log('   Password: admin123');
        console.log('═══════════════════════════════════════\n');
    }

    db.close();
} catch (error) {
    console.error('❌ Error:', error.message);
}
