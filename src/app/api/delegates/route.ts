import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ensure "Self" exists with upsert
    await (prisma as any).delegate.upsert({
      where: { name: "Self" },
      update: {},
      create: { name: "Self", email: "me@example.com" },
    });

    const delegates = await (prisma as any).delegate.findMany({
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
    const body = await request.json();
    const delegate = await (prisma as any).delegate.create({
      data: {
        name: body.name,
        email: body.email || null,
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
    const body = await request.json();
    const { id, ...data } = body;
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Protect "Self"
    const delegate = await (prisma as any).delegate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!delegate) {
      return NextResponse.json(
        { error: "Delegate not found" },
        { status: 404 },
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
