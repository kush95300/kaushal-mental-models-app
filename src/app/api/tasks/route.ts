import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function verifyWorkspaceAccess(workspaceId: number, session: any) {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const workspaceIdParam = searchParams.get("workspaceId");

    const where: any = includeDeleted ? {} : { isDeleted: false };

    if (workspaceIdParam) {
      const wsId = parseInt(workspaceIdParam);
      if (!(await verifyWorkspaceAccess(wsId, session))) {
        return NextResponse.json(
          { error: "Unauthorized workspace access" },
          { status: 403 },
        );
      }
      where.workspaceId = wsId;
    } else if (!session.isAdmin) {
      where.workspace = { userId: session.id };
    }

    const tasks = await (prisma as any).task.findMany({
      where,
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
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const workspaceId = body.workspaceId ? parseInt(body.workspaceId) : 1;
    if (!(await verifyWorkspaceAccess(workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

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
          workspaceId,
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
        workspaceId,
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
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;

    const existing = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (!(await verifyWorkspaceAccess(existing.workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

    // Sanitize updates
    if (updates.workspaceId) updates.workspaceId = parseInt(updates.workspaceId);
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

    // Workspace change validation and delegate reassignment
    if (updates.workspaceId && updates.workspaceId !== existing.workspaceId) {
      if (!(await verifyWorkspaceAccess(updates.workspaceId, session))) {
        return NextResponse.json(
          { error: "Unauthorized workspace access" },
          { status: 403 },
        );
      }
      updates.workspace = { connect: { id: updates.workspaceId } };

      const selfDelegate = await (prisma as any).delegate.findFirst({
        where: {
          name: { in: ["Self", "self", "SELF"] },
          workspaceId: updates.workspaceId,
        },
      });
      if (selfDelegate) {
        updates.delegateId = selfDelegate.id;
      } else {
        updates.delegate = { disconnect: true };
      }
      delete updates.workspaceId;
    } else if (updates.quadrant && updates.quadrant !== "DELEGATE") {
      // Business Rule: If moving out of DELEGATE quadrant, auto-assign to Self
      const selfDelegate = await (prisma as any).delegate.findFirst({
        where: {
          name: {
            in: ["Self", "self", "SELF"],
          },
          workspaceId: existing.workspaceId,
        },
      });
      if (selfDelegate) {
        updates.delegateId = selfDelegate.id;
      }
    }

    if (updates.delegateId) {
      updates.delegate = { connect: { id: updates.delegateId } };
      delete updates.delegateId;
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
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const mode = searchParams.get("mode"); // 'revert' or 'hard'
    const reset = searchParams.get("reset"); // 'today' or 'all'

    if (reset === "all") {
      if (!session.isAdmin)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      await (prisma as any).task.deleteMany({});
      return NextResponse.json({ success: true });
    }

    if (reset === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!session.isAdmin) {
        const userWorkspaces = await prisma.workspace.findMany({
          where: { userId: session.id },
          select: { id: true },
        });
        const wsIds = userWorkspaces.map((w) => w.id);
        await (prisma as any).task.deleteMany({
          where: { workspaceId: { in: wsIds }, createdAt: { gte: today } },
        });
      } else {
        await (prisma as any).task.deleteMany({
          where: { createdAt: { gte: today } },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const taskId = parseInt(id);
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (!(await verifyWorkspaceAccess(existing.workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

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
