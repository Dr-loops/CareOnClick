import { NextResponse } from 'next/server';

export async function GET() {
    const vars = {
        DATABASE_URL: process.env.DATABASE_URL,
        ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
    };

    const status = {
        database_url: vars.DATABASE_URL ? (vars.DATABASE_URL.startsWith('postgres') ? '✅ Present' : '⚠️ Invalid Format') : '❌ MISSING',
        admin_secret: vars.ADMIN_SECRET_KEY ? '✅ Present' : '❌ MISSING',
        auth_secret: vars.AUTH_SECRET ? '✅ Present' : '❌ MISSING',
        environment: vars.NODE_ENV || 'unknown'
    };

    return NextResponse.json({
        status: status,
        message: "If any of these checkmarks are Red (❌), you must add that variable in Vercel Settings and REDEPLOY."
    });
}
