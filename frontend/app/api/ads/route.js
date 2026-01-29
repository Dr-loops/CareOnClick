import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Static Ads for WhatsApp Campaign
        const ads = [
            {
                id: 'ad-1',
                title: 'Coconut Shake Variant 1',
                type: 'IMAGE',
                url: '/ads/ad_1.jpg',
                link: 'https://wa.me/233540509530',
                priority: 10
            },
            {
                id: 'ad-2',
                title: 'Coconut Shake Variant 2',
                type: 'IMAGE',
                url: '/ads/ad_2.jpg',
                link: 'https://wa.me/233540509530',
                priority: 10
            },
            {
                id: 'ad-3',
                title: 'Coconut Shake Variant 3',
                type: 'IMAGE',
                url: '/ads/ad_3.jpg',
                link: 'https://wa.me/233540509530',
                priority: 10
            },
            {
                id: 'ad-4',
                title: 'Coconut Shake Variant 4',
                type: 'IMAGE',
                url: '/ads/ad_4.jpg',
                link: 'https://wa.me/233540509530',
                priority: 10
            },
            {
                id: 'ad-5',
                title: 'Coconut Shake Variant 5',
                type: 'IMAGE',
                url: '/ads/ad_5.jpg',
                link: 'https://wa.me/233540509530',
                priority: 10
            }
        ];

        // return NextResponse.json({ success: true, data: ads });
        return NextResponse.json({ success: true, data: ads });
    } catch (error) {
        console.error("Failed to fetch ads:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch ads" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, type, url, link, priority, startDate, endDate } = body;

        // Basic validation
        if (!title || !type || !url) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newAd = await prisma.ad.create({
            data: {
                title,
                type,
                url,
                link,
                priority: priority || 0,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null
            }
        });

        return NextResponse.json({ success: true, data: newAd });
    } catch (error) {
        console.error("Failed to create ad:", error);
        return NextResponse.json({ success: false, error: "Failed to create ad" }, { status: 500 });
    }
}
