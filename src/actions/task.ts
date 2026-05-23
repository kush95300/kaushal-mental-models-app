"use server";

import prisma from "@/lib/prisma";
import { Task, Delegate } from "@/types/eisenhower";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { verifyWorkspaceAccess } from "@/lib/workspace-access";

export async function getTasks(workspaceId?: number, includeDeleted = false) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    if (workspaceId) {
      const access = await verifyWorkspaceAccess(workspaceId);
      if (!access.success) return { success: false, error: access.error };
    }

    const where: Prisma.TaskWhereInput = includeDeleted
      ? {}
      : { isDeleted: false };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    } else if (!session.isAdmin) {
      where.workspace = { userId: session.id };
    }

    const tasks = (await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { delegate: true },
    })) as unknown as Task[];
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Get tasks error:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function createTask(data: {
  content: string;
  isImportant?: boolean;
  isUrgent?: boolean;
  quadrant?: string;
  dueDate?: string | null;
  delegateId?: number | null;
  estimatedMinutes?: number | null;
  status?: string;
  workspaceId?: number;
}) {
  try {
    const workspaceId = data.workspaceId || 1;
    const access = await verifyWorkspaceAccess(workspaceId);
    if (!access.success) return { success: false, error: access.error };

    let finalDelegateId = data.delegateId;
    if (!finalDelegateId) {
      const selfDelegate = (await prisma.delegate.findFirst({
        where: { name: { in: ["Self", "self", "SELF"] }, workspaceId },
      })) as Delegate | null;
      if (selfDelegate) finalDelegateId = selfDelegate.id;
    }

    const task = await prisma.task.create({
      data: {
        content: data.content,
        isImportant: data.isImportant || false,
        isUrgent: data.isUrgent || false,
        quadrant: data.quadrant || "INBOX",
        status: data.status || "TODO",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        delegateId: finalDelegateId,
        estimatedMinutes: data.estimatedMinutes || null,
        workspaceId,
      },
      include: { delegate: true },
    });

    revalidatePath("/eisenhower-matrix");
    return { success: true, data: task };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(id: number, updates: Partial<Task>) {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };

    const access = await verifyWorkspaceAccess(existing.workspaceId);
    if (!access.success) return { success: false, error: access.error };

    const data: Prisma.TaskUpdateInput = { ...updates } as any;

    if (updates.dueDate)
      data.dueDate = new Date(updates.dueDate as string | Date);
    if (updates.delegateId)
      data.delegate = {
        connect: { id: parseInt(updates.delegateId as unknown as string) },
      };

    // Cleanup incompatible types
    delete (data as any).delegateId;
    delete (data as any).id;

    // Business Rule: If moving out of DELEGATE quadrant, auto-assign to Self
    if (data.quadrant && data.quadrant !== "DELEGATE") {
      const selfDelegate = (await prisma.delegate.findFirst({
        where: {
          name: { in: ["Self", "self", "SELF"] },
          workspaceId: existing.workspaceId,
        },
      })) as Delegate | null;
      if (selfDelegate) data.delegate = { connect: { id: selfDelegate.id } };
    }

    // Handle analytics tracking
    if (data.status === "DONE") {
      data.completedAt = new Date();
    } else if (data.status === "TODO") {
      data.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { delegate: true },
    });

    revalidatePath("/eisenhower-matrix");
    return { success: true, data: task };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTaskAction(
  id: number,
  mode: "soft" | "hard" | "revert" = "soft",
) {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };

    const access = await verifyWorkspaceAccess(existing.workspaceId);
    if (!access.success) return { success: false, error: access.error };

    if (mode === "revert") {
      await prisma.task.update({
        where: { id },
        data: { isDeleted: false },
      });
    } else if (mode === "hard") {
      await prisma.task.delete({
        where: { id },
      });
    } else {
      await prisma.task.update({
        where: { id },
        data: { isDeleted: true },
      });
    }

    revalidatePath("/eisenhower-matrix");
    return { success: true };
  } catch (error) {
    console.error("Delete task error:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

export async function resetTasksAction(type: "today" | "all") {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!session.isAdmin) {
      const userWorkspaces = await prisma.workspace.findMany({
        where: { userId: session.id },
        select: { id: true },
      });
      const wsIds = userWorkspaces.map((w) => w.id);
      if (type === "all") {
        await prisma.task.deleteMany({ where: { workspaceId: { in: wsIds } } });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.task.deleteMany({
          where: { workspaceId: { in: wsIds }, createdAt: { gte: today } },
        });
      }
    } else {
      if (type === "all") {
        await prisma.task.deleteMany({});
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.task.deleteMany({
          where: { createdAt: { gte: today } },
        });
      }
    }

    revalidatePath("/eisenhower-matrix");
    return { success: true };
  } catch (error) {
    console.error("Reset tasks error:", error);
    return { success: false, error: "Failed to reset tasks" };
  }
}
