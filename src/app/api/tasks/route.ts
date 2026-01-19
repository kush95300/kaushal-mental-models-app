import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const tasks = await (prisma as any).task.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
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
      const selfDelegate = await (prisma as any).delegate.findFirst({
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

    // Business Rule: If moving out of DELEGATE/INBOX, auto-assign to Self
    if (
      updates.quadrant &&
      updates.quadrant !== "DELEGATE" &&
      updates.quadrant !== "INBOX"
    ) {
      const selfDelegate = await (prisma as any).delegate.findFirst({
        where: {
          name: {
            in: ["Self", "self", "SELF"],
          },
        },
      });
      if (selfDelegate) {
        updates.delegateId = selfDelegate.id;
      }
    }

    // Handle analytics tracking
    if (updates.status === "DONE") {
      updates.completedAt = new Date();
    } else if (updates.status === "TODO") {
      updates.completedAt = null;
    }

    // Exclude 'id' from the data payload
    const { id: _id, ...dataToUpdate } = updates;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        delegate: true,
      },
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
    const mode = searchParams.get("mode"); // 'revert' or 'hard'
    const reset = searchParams.get("reset"); // 'today' or 'all'

    if (reset === "all") {
      await (prisma as any).task.deleteMany({});
      return NextResponse.json({ success: true });
    }

    if (reset === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await (prisma as any).task.deleteMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });
      return NextResponse.json({ success: true });
    }

    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const taskId = parseInt(id);

    if (mode === "revert") {
      await (prisma as any).task.update({
        where: { id: taskId },
        data: { isDeleted: false },
      });
    } else if (mode === "hard") {
      await (prisma as any).task.delete({
        where: { id: taskId },
      });
    } else {
      // Soft delete by default
      await (prisma as any).task.update({
        where: { id: taskId },
        data: { isDeleted: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
