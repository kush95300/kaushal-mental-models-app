import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(a: Date, b: Date) {
  const startOfWeek = (d: Date) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() - dt.getDay());
    dt.setHours(0, 0, 0, 0);
    return dt;
  };
  return startOfWeek(a).getTime() === startOfWeek(b).getTime();
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Load global settings
    let settings = await (prisma as any).chatQuotaSettings.findFirst();
    if (!settings) {
      settings = await (prisma as any).chatQuotaSettings.create({
        data: { period: "DAY", defaultLimit: 20 },
      });
    }

    const now = new Date();

    // Load usage
    let usage = await (prisma as any).userChatUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      usage = await (prisma as any).userChatUsage.create({
        data: { userId, usedToday: 0, usedThisWeek: 0, extraQuota: 0, lastResetDate: now },
      });
    }

    const lastReset = new Date(usage.lastResetDate);

    // Reset counters if boundary crossed
    let needsReset = false;
    if (settings.period === "DAY" && !isSameDay(lastReset, now)) needsReset = true;
    if (settings.period === "WEEK" && !isSameWeek(lastReset, now)) needsReset = true;

    if (needsReset) {
      usage = await (prisma as any).userChatUsage.update({
        where: { userId },
        data: { usedToday: 0, usedThisWeek: 0, extraQuota: 0, lastResetDate: now },
      });
    }

    const effectiveLimit = Math.min(100, settings.defaultLimit + (usage.extraQuota ?? 0));
    const currentUsed = settings.period === "DAY" ? usage.usedToday : usage.usedThisWeek;

    return NextResponse.json({
      used: currentUsed,
      limit: effectiveLimit,
      period: settings.period,
      exhausted: currentUsed >= effectiveLimit,
    });
  } catch (error) {
    console.error("Quota status route error:", error);
    return NextResponse.json({ error: "Failed to fetch quota status" }, { status: 500 });
  }
}
