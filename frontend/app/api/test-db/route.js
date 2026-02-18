import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.user.count();
        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error("Test DB Error:", error);
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
