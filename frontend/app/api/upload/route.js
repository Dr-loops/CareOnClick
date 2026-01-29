
import { NextResponse } from 'next/server';
import { StorageManager } from '@/lib/storage';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file types (optional, but good practice)
        // const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        // if (!validTypes.includes(file.type)) {
        //     return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        // }

        // Max size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 });
        }

        const result = await StorageManager.uploadFile(file);

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
