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
    const {
      content,
      isImportant,
      isUrgent,
      quadrant,
      dueDate,
      delegateId: incomingDelegateId,
      estimatedMinutes,
      status,
    } = body;

    // Ensure we have a delegateId, default to "Self" (usually ID 1)
    let finalDelegateId = incomingDelegateId
      ? parseInt(incomingDelegateId)
      : null;
    if (!finalDelegateId) {
      const selfDelegate = await (prisma as any).delegate.findFirst({
        where: {
          name: {
            in: ["Self", "self", "SELF"],
          },
        },
      });
      if (selfDelegate) finalDelegateId = selfDelegate.id;
    }

    const task = await prisma.task.create({
      data: {
        content: content,
        isImportant: isImportant || false,
        isUrgent: isUrgent || false,
        quadrant: quadrant || "INBOX",
        status: status || "TODO",
        dueDate: dueDate ? new Date(dueDate) : null,
        delegateId: finalDelegateId,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
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
    if (updates.estimatedMinutes !== undefined) {
      updates.estimatedMinutes = updates.estimatedMinutes
        ? parseInt(updates.estimatedMinutes)
        : null;
    }
    if (updates.actualMinutes !== undefined) {
      updates.actualMinutes = updates.actualMinutes
        ? parseInt(updates.actualMinutes)
        : null;
    }

    // Business Rule: If moving out of DELEGATE quadrant, auto-assign to Self
    if (updates.quadrant && updates.quadrant !== "DELEGATE") {
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

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updates,
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
