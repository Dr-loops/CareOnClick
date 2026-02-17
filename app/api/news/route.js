import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const news = await prisma.newsItem.findMany({
            where: {
                published: true,
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: 20 // Limit to recent 20 items
        });
        return NextResponse.json({ success: true, data: news });
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, summary, content, imageUrl, category } = body;

        // Basic validation
        if (!title || !summary || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newNews = await prisma.newsItem.create({
            data: {
                title,
                summary,
                content,
                imageUrl,
                category: category || 'General',
                published: true
            }
        });

        return NextResponse.json({ success: true, data: newNews });
    } catch (error) {
        console.error("Failed to create news:", error);
        return NextResponse.json({ success: false, error: "Failed to create news" }, { status: 500 });
    }
}
