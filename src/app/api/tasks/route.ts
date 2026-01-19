import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const task = await prisma.task.create({
            data: {
                content: body.content,
                isImportant: body.isImportant,
                isUrgent: body.isUrgent,
            },
        });
        return NextResponse.json(task);
    } catch (error) {
        console.error('Create task error:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        const task = await prisma.task.update({
            where: { id },
            data: updates,
        });
        return NextResponse.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
