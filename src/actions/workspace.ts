"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWorkspaces() {
  try {
    const workspaces = await prisma.workspace.findMany({
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
    const config = await prisma.userConfig.findUnique({
      where: { id: 1 },
    });
    return { success: true, data: config };
  } catch (error) {
    console.error("Get config error:", error);
    return { success: false, error: "Failed to fetch config" };
  }
}

export async function updateActiveWorkspace(workspaceId: number) {
  try {
    const config = await prisma.userConfig.update({
      where: { id: 1 },
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
}) {
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "indigo",
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
  data: { name?: string; description?: string; color?: string },
) {
  try {
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
    const config = await prisma.userConfig.update({
      where: { id: 1 },
      data: { maxDailyMinutes: minutes },
    });
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: config };
  } catch (error) {
    console.error("Update max daily minutes error:", error);
    return { success: false, error: "Failed to update max daily minutes" };
  }
}
