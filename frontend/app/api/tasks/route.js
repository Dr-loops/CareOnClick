
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure this path is correct based, usually in lib/prisma.js or lib/db.ts
// If prisma client is not exported from a lib file, we might need to instantiate it or find where it is.
// Based on file list, there is a `lib/prisma.js`.

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const assignedToId = searchParams.get('assignedToId');
        const patientId = searchParams.get('patientId');

        const where = {};
        if (assignedToId) where.assignedToId = assignedToId;
        if (patientId) where.patientId = patientId;

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                patient: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { patientId, assignedToId, description, category, priority, dueDate } = body;

        if (!patientId || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch patient name to cache it if needed, though relation handles it.
        // The schema has patientName field, let's try to populate it.
        const patient = await prisma.user.findUnique({ where: { id: patientId } });

        const newTask = await prisma.task.create({
            data: {
                patientId,
                patientName: patient?.name || 'Unknown',
                assignedToId,
                description,
                category: category || 'General',
                priority: priority || 'Normal',
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'Pending',
            },
        });

        return NextResponse.json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, status, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status,
                ...updates,
                completedAt: status === 'Completed' ? new Date() : null, // Set completedAt if completing
            },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
