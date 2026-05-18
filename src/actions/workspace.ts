"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getWorkspaces() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    // If admin, adopt any legacy unassigned workspaces
    if (session.isAdmin) {
      try {
        await prisma.workspace.updateMany({
          where: { userId: null },
          data: { userId: session.id },
        });
      } catch (err) {
        // Ignore unique constraint collisions
      }
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId: session.id },
      orderBy: { name: "asc" },
    });
    return { success: true, data: workspaces };
  } catch (error) {
    console.error("Get workspaces error:", error);
    return { success: false, error: "Failed to fetch workspaces" };
  }
}

export async function getUserConfig() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    
    const config = await prisma.user.findUnique({
      where: { id: session.id },
    });
    return { success: true, data: config };
  } catch (error) {
    console.error("Get config error:", error);
    return { success: false, error: "Failed to fetch config" };
  }
}

export async function updateActiveWorkspace(workspaceId: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
      return { success: false, error: "Unauthorized workspace access" };
    }

    const config = await prisma.user.update({
      where: { id: session.id },
      data: { activeWorkspaceId: workspaceId },
    });
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: config };
  } catch (error) {
    console.error("Update active workspace error:", error);
    return { success: false, error: "Failed to update active workspace" };
  }
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "indigo",
        icon: data.icon || "Briefcase",
        userId: session.id,
      },
    });
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: workspace };
  } catch (error) {
    console.error("Create workspace error:", error);
    return { success: false, error: "Failed to create workspace" };
  }
}

export async function updateWorkspace(
  id: number,
  data: { name?: string; description?: string; color?: string; icon?: string },
) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const ws = await prisma.workspace.findUnique({ where: { id } });
    if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
      return { success: false, error: "Unauthorized workspace access" };
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data,
    });
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: workspace };
  } catch (error) {
    console.error("Update workspace error:", error);
    return { success: false, error: "Failed to update workspace" };
  }
}

export async function deleteWorkspace(id: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const ws = await prisma.workspace.findUnique({ where: { id } });
    if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
      return { success: false, error: "Unauthorized workspace access" };
    }

    await prisma.task.deleteMany({ where: { workspaceId: id } });
    await prisma.workspace.delete({ where: { id } });
    revalidatePath("/eisenhower-matrix");
    return { success: true };
  } catch (error) {
    console.error("Delete workspace error:", error);
    return { success: false, error: "Failed to delete workspace" };
  }
}

export async function updateMaxDailyMinutes(minutes: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const config = await prisma.user.update({
      where: { id: session.id },
      data: { maxDailyMinutes: minutes },
    });
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: config };
  } catch (error) {
    console.error("Update max daily minutes error:", error);
    return { success: false, error: "Failed to update max daily minutes" };
  }
}
