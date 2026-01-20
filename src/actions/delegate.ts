"use server";

import prisma from "@/lib/prisma";
import { Delegate } from "@/types/eisenhower";
import { revalidatePath } from "next/cache";

export async function getDelegates() {
  try {
    // Ensure "Self" exists
    await prisma.delegate.upsert({
      where: { name: "Self" },
      update: {},
      create: {
        id: 1,
        name: "Self",
        email: "me@example.com",
      },
    });

    const delegates = (await prisma.delegate.findMany({
      orderBy: { createdAt: "desc" },
    })) as unknown as Delegate[];
    return { success: true, data: delegates };
  } catch (error) {
    console.error("Get delegates error:", error);
    return { success: false, error: "Failed to fetch delegates" };
  }
}

export async function createDelegate(data: { name: string; email?: string }) {
  try {
    const delegate = (await prisma.delegate.create({
      data: {
        name: data.name,
        email: data.email || null,
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
