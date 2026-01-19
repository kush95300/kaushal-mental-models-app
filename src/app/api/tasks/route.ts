import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { delegate: true },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ensure we have a delegateId, default to "Self" (usually ID 1)
    let delegateId = body.delegateId ? parseInt(body.delegateId) : null;
    if (!delegateId) {
      const selfDelegate = await prisma.delegate.findFirst({
        where: { name: "Self" },
      });
      if (selfDelegate) delegateId = selfDelegate.id;
    }

    const task = await prisma.task.create({
      data: {
        content: body.content,
        isImportant: body.isImportant || false,
        isUrgent: body.isUrgent || false,
        quadrant: body.quadrant || "INBOX",
        status: body.status || "TODO",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        delegateId: delegateId,
      },
      include: { delegate: true },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Sanitize updates
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
    if (updates.delegateId) updates.delegateId = parseInt(updates.delegateId);

    // Handle analytics tracking
    if (updates.status === "DONE") {
      updates.completedAt = new Date();
    } else if (updates.status === "TODO") {
      updates.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updates,
      include: { delegate: true },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
