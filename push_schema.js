const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Target directory
const frontendDir = path.join(__dirname, 'frontend');

// Load .env to get the Neon URL
const envPath = path.join(frontendDir, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const DATABASE_URL = dbUrlMatch[1];
console.log('Using DATABASE_URL:', DATABASE_URL.substring(0, 20) + '...');

try {
    console.log('Running prisma db push...');
    // Set environment variable and run command
    execSync('npx prisma db push --schema=prisma/schema.prisma', {
        cwd: frontendDir,
        env: { ...process.env, DATABASE_URL },
        stdio: 'inherit'
    });
    console.log('✅ Schema pushed successfully!');
} catch (e) {
    console.error('❌ Failed to push schema:', e.message);
    process.exit(1);
}
