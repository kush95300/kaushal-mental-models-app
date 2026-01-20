"use server";

import prisma from "@/lib/prisma";
import { Task, Delegate } from "@/types/eisenhower";
import { revalidatePath } from "next/cache";

export async function getTasks(includeDeleted = false) {
  try {
    const tasks = (await prisma.task.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
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
}) {
  try {
    let finalDelegateId = data.delegateId;
    if (!finalDelegateId) {
      const selfDelegate = (await prisma.delegate.findFirst({
        where: { name: { in: ["Self", "self", "SELF"] } },
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
    const data: any = { ...updates };

    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.delegateId) data.delegateId = parseInt(data.delegateId as any);

    // Business Rule: If moving out of DELEGATE quadrant, auto-assign to Self
    if (data.quadrant && data.quadrant !== "DELEGATE") {
      const selfDelegate = (await prisma.delegate.findFirst({
        where: { name: { in: ["Self", "self", "SELF"] } },
      })) as Delegate | null;
      if (selfDelegate) data.delegateId = selfDelegate.id;
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
    if (type === "all") {
      await prisma.task.deleteMany({});
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.task.deleteMany({
        where: { createdAt: { gte: today } },
      });
    }

    revalidatePath("/eisenhower-matrix");
    return { success: true };
  } catch (error) {
    console.error("Reset tasks error:", error);
    return { success: false, error: "Failed to reset tasks" };
  }
}
