"use server";

import prisma from "@/lib/prisma";
import { Delegate } from "@/types/eisenhower";
import { revalidatePath } from "next/cache";
import { verifyWorkspaceAccess } from "@/lib/workspace-access";

export async function getDelegates(workspaceId: number) {
  try {
    const access = await verifyWorkspaceAccess(workspaceId);
    if (!access.success) return { success: false, error: access.error };

    // Ensure "Self" exists
    await prisma.delegate.upsert({
      where: {
        name_workspaceId: {
          name: "Self",
          workspaceId,
        },
      },
      update: {},
      create: {
        name: "Self",
        email: "me@example.com",
        workspaceId,
      },
    });

    const delegates = (await prisma.delegate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    })) as unknown as Delegate[];
    return { success: true, data: delegates };
  } catch (error) {
    console.error("Get delegates error:", error);
    return { success: false, error: "Failed to fetch delegates" };
  }
}

export async function createDelegate(data: {
  name: string;
  email?: string;
  workspaceId: number;
}) {
  try {
    const access = await verifyWorkspaceAccess(data.workspaceId);
    if (!access.success) return { success: false, error: access.error };

    const delegate = (await prisma.delegate.create({
      data: {
        name: data.name,
        email: data.email || null,
        workspaceId: data.workspaceId,
      },
    })) as unknown as Delegate;
    revalidatePath("/eisenhower-matrix");
    return { success: true, data: delegate };
  } catch (error) {
    console.error("Create delegate error:", error);
    return { success: false, error: "Failed to create delegate" };
  }
}

export async function deleteDelegateAction(id: number) {
  try {
    const delegate = (await prisma.delegate.findUnique({
      where: { id },
    })) as any;
    if (!delegate) return { success: false, error: "Delegate not found" };

    const access = await verifyWorkspaceAccess(delegate.workspaceId);
    if (!access.success) return { success: false, error: access.error };

    if (delegate.name === "Self")
      return { success: false, error: "Cannot delete Self" };

    await prisma.delegate.delete({ where: { id } });
    revalidatePath("/eisenhower-matrix");
    return { success: true };
  } catch (error) {
    console.error("Delete delegate error:", error);
    return { success: false, error: "Failed to delete delegate" };
  }
}
