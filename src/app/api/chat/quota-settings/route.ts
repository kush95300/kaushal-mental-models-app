/**
 * GET /api/chat/quota-settings  — read current global quota settings
 * POST /api/chat/quota-settings — admin saves global quota settings
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await (prisma as any).chatQuotaSettings.findFirst();
  if (!settings) {
    settings = await (prisma as any).chatQuotaSettings.create({
      data: { period: "DAY", defaultLimit: 20 },
    });
  }

  return NextResponse.json({ period: settings.period, defaultLimit: settings.defaultLimit });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json();
  const period = body.period === "WEEK" ? "WEEK" : "DAY";
  const defaultLimit = Math.max(1, parseInt(body.defaultLimit ?? "20") || 20);

  let settings = await (prisma as any).chatQuotaSettings.findFirst();
  if (settings) {
    settings = await (prisma as any).chatQuotaSettings.update({
      where: { id: settings.id },
      data: { period, defaultLimit },
    });
  } else {
    settings = await (prisma as any).chatQuotaSettings.create({
      data: { period, defaultLimit },
    });
  }

  return NextResponse.json({ success: true, period: settings.period, defaultLimit: settings.defaultLimit });
}
