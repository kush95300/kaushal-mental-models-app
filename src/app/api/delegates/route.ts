import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        let delegates = await prisma.delegate.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Ensure "Self" exists
        if (!delegates.some(d => d.name === 'Self')) {
            const self = await prisma.delegate.create({
                data: { name: 'Self', email: 'me@example.com' }
            });
            delegates = [self, ...delegates];
        }

        return NextResponse.json(delegates);
    } catch (error) {
        console.error('Fetch delegates error:', error);
        return NextResponse.json({ error: 'Failed to fetch delegates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const delegate = await prisma.delegate.create({
            data: {
                name: body.name,
                email: body.email || null,
            },
        });
        return NextResponse.json(delegate);
    } catch (error) {
        console.error('Create delegate error:', error);
        return NextResponse.json({ error: 'Failed to create delegate' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        const delegate = await prisma.delegate.update({
            where: { id: parseInt(id) },
            data,
        });
        return NextResponse.json(delegate);
    } catch (error) {
        console.error('Update delegate error:', error);
        return NextResponse.json({ error: 'Failed to update delegate' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.delegate.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete delegate error:', error);
        return NextResponse.json({ error: 'Failed to delete delegate' }, { status: 500 });
    }
}
