import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const workspaceIdParam = searchParams.get("workspaceId");
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : 1;

    if (!(await verifyWorkspaceAccess(workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

    // Ensure "Self" exists with upsert
    await (prisma as any).delegate.upsert({
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

    const delegates = await (prisma as any).delegate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(delegates);
  } catch (error) {
    console.error("Fetch delegates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delegates" },
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

    const delegate = await (prisma as any).delegate.create({
      data: {
        name: body.name,
        email: body.email || null,
        workspaceId,
      },
    });
    return NextResponse.json(delegate);
  } catch (error) {
    console.error("Create delegate error:", error);
    return NextResponse.json(
      { error: "Failed to create delegate" },
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
    const { id, ...data } = body;

    const existing = await (prisma as any).delegate.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Delegate not found" },
        { status: 404 },
      );
    if (!(await verifyWorkspaceAccess(existing.workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

    const delegate = await (prisma as any).delegate.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(delegate);
  } catch (error) {
    console.error("Update delegate error:", error);
    return NextResponse.json(
      { error: "Failed to update delegate" },
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
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const delegate = await (prisma as any).delegate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!delegate) {
      return NextResponse.json(
        { error: "Delegate not found" },
        { status: 404 },
      );
    }

    if (!(await verifyWorkspaceAccess(delegate.workspaceId, session))) {
      return NextResponse.json(
        { error: "Unauthorized workspace access" },
        { status: 403 },
      );
    }

    if (delegate.name === "Self") {
      return NextResponse.json(
        { error: "Cannot delete the Self delegate" },
        { status: 403 },
      );
    }

    await (prisma as any).delegate.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete delegate error:", error);
    return NextResponse.json(
      { error: "Failed to delete delegate" },
      { status: 500 },
    );
  }
}
