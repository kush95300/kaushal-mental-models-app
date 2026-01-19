import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let config = await (prisma as any).userConfig.findFirst();

    if (!config) {
      config = await (prisma as any).userConfig.create({
        data: {},
      });
    }

    return NextResponse.json(config);
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
    const body = await request.json();
    const config = await (prisma as any).userConfig.upsert({
      where: { id: 1 },
      update: {
        analyticsStartDate: body.analyticsStartDate
          ? new Date(body.analyticsStartDate)
          : null,
      },
      create: {
        id: 1,
        analyticsStartDate: body.analyticsStartDate
          ? new Date(body.analyticsStartDate)
          : null,
      },
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 },
    );
  }
}
