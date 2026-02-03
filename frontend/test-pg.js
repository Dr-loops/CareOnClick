const { Client } = require('pg');

const connectionString = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?sslmode=require";

async function test() {
    const client = new Client({ connectionString });
    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected successfully!');
        const res = await client.query('SELECT email, role FROM "User" WHERE email = $1', ['drkalsvirtualhospital@gmail.com']);
        console.log('User status:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

test();
