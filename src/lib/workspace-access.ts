import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function verifyWorkspaceAccess(workspaceId: number | string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  const targetId = typeof workspaceId === "string" ? parseInt(workspaceId) : workspaceId;
  const ws = await prisma.workspace.findUnique({ where: { id: targetId } });
  if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
    return { success: false, error: "Unauthorized workspace access" };
  }
  return { success: true, session };
}
