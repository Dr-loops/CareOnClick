import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    let dbStatus = 'Checking...';
    let adminFound = 'Checking...';
    let userCount = 0;
    let dbHost = 'Unknown';

    try {
        const count = await prisma.user.count();
        userCount = count;
        dbStatus = '✅ Connected';

        const admin = await prisma.user.findUnique({
            where: { email: 'drkalsvirtualhospital@gmail.com' }
        });
        adminFound = admin ? `✅ Found (Role: ${admin.role})` : '❌ NOT FOUND';

        // Try to identify the DB host from the connection
        const dbUrl = process.env.DATABASE_URL || '';
        if (dbUrl.includes('neon.tech')) dbHost = 'Neon';
        else if (dbUrl.includes('supabase.co')) dbHost = 'Supabase';
        else dbHost = 'Other/Unknown';

    } catch (e) {
        dbStatus = `❌ Error: ${e.message}`;
    }

    const vars = {
        DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
        AUTH_SECRET: process.env.AUTH_SECRET ? 'PRESENT' : 'MISSING',
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Neon Production Debugger</h1>

            <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h2>1. Database Connection</h2>
                <p>Status: <strong>{dbStatus}</strong></p>
                <p>Database Platform: <strong>{dbHost}</strong></p>
                <p>Total Users in DB: <strong>{userCount}</strong></p>
                <p>Admin User Check: <strong>{adminFound}</strong></p>
            </section>

            <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h2>2. Environment Status</h2>
                <pre>{JSON.stringify(vars, null, 2)}</pre>
            </section>

            <div style={{ padding: '1rem', background: '#f0f9ff', borderLeft: '5px solid #0070f3', borderRadius: '4px' }}>
                <h3>Final Troubleshooting:</h3>
                <ul>
                    <li>If it says <b>Supabase</b> but you want <b>Neon</b>: You MUST update the URL in Vercel. Pushing <code>.env</code> to GitHub <b>doesn't</b> change Vercel.</li>
                    <li>If <b>dbStatus</b> is an Error: Your password or host in Vercel is wrong.</li>
                    <li>If <b>adminFound</b> is ❌ NOT FOUND: You are connected to an empty database.</li>
                </ul>
            </div>
        </div>
    );
}
