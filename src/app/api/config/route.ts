import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fetch config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        analyticsStartDate: body.analyticsStartDate
          ? new Date(body.analyticsStartDate)
          : null,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 },
    );
  }
}
