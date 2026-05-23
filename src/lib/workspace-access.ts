import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function verifyWorkspaceAccess(workspaceId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws || (ws.userId !== session.id && !session.isAdmin)) {
    return { success: false, error: "Unauthorized workspace access" };
  }
  return { success: true, session };
}
