/**
 * POST /api/chat/quota-request   — user raises a quota increase request
 * PATCH /api/chat/quota-request  — admin approves / rejects a request
 * GET  /api/chat/quota-request   — admin lists pending requests
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── GET — Admin: list all pending quota requests ──────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const requests = await (prisma as any).chatQuotaRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

// ── POST — User: request extra quota ─────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const requestedExtra = parseInt(body.requestedExtra ?? "0");
  const reason = body.reason?.trim() ?? null;

  if (!requestedExtra || requestedExtra <= 0) {
    return NextResponse.json({ error: "requestedExtra must be a positive integer" }, { status: 400 });
  }

  // Enforce max 100 messages per day hard limit
  const settings = await (prisma as any).chatQuotaSettings.findFirst();
  const defaultLimit = settings?.defaultLimit ?? 20;

  const usage = await (prisma as any).userChatUsage.findUnique({
    where: { userId: session.id },
  });
  const currentExtra = usage?.extraQuota ?? 0;

  if (defaultLimit + currentExtra + requestedExtra > 100) {
    return NextResponse.json(
      { error: `Requested amount exceeds the maximum hard limit of 100 messages per day (current limit: ${defaultLimit + currentExtra}, requested: +${requestedExtra}).` },
      { status: 400 }
    );
  }

  // Prevent duplicate pending requests
  const existing = await (prisma as any).chatQuotaRequest.findFirst({
    where: { userId: session.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending quota request. Please wait for admin approval." },
      { status: 409 },
    );
  }

  const req = await (prisma as any).chatQuotaRequest.create({
    data: { userId: session.id, requestedExtra, reason },
  });

  return NextResponse.json({ success: true, request: req });
}

// ── PATCH — Admin: approve or reject a quota request ─────────────────────────
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json();
  const { requestId, action, approvedAmount, adminNote } = body;
  // action: "approve" | "partially_approve" | "reject"

  if (!requestId || !action) {
    return NextResponse.json({ error: "requestId and action are required" }, { status: 400 });
  }

  const quotaReq = await (prisma as any).chatQuotaRequest.findUnique({
    where: { id: parseInt(requestId) },
  });
  if (!quotaReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (quotaReq.status !== "PENDING") {
    return NextResponse.json({ error: "Request already resolved" }, { status: 409 });
  }

  let newStatus = "REJECTED";
  let finalApprovedAmount: number | null = null;

  if (action === "approve") {
    newStatus = "APPROVED";
    finalApprovedAmount = quotaReq.requestedExtra;
  } else if (action === "partially_approve") {
    const amt = parseInt(approvedAmount ?? "0");
    if (!amt || amt <= 0) {
      return NextResponse.json({ error: "approvedAmount must be positive for partial approval" }, { status: 400 });
    }
    newStatus = "PARTIALLY_APPROVED";
    finalApprovedAmount = amt;
  }

  if (finalApprovedAmount && finalApprovedAmount > 0) {
    const settings = await (prisma as any).chatQuotaSettings.findFirst();
    const defaultLimit = settings?.defaultLimit ?? 20;

    const usage = await (prisma as any).userChatUsage.findUnique({
      where: { userId: quotaReq.userId },
    });
    const currentExtra = usage?.extraQuota ?? 0;

    if (defaultLimit + currentExtra + finalApprovedAmount > 100) {
      return NextResponse.json(
        { error: `Approval denied. The total daily limit cannot exceed 100 messages. (Current: ${defaultLimit + currentExtra}, Approved: +${finalApprovedAmount})` },
        { status: 400 }
      );
    }
  }

  // Update the request record
  await (prisma as any).chatQuotaRequest.update({
    where: { id: quotaReq.id },
    data: {
      status: newStatus,
      approvedAmount: finalApprovedAmount,
      adminNote: adminNote ?? null,
      resolvedAt: new Date(),
    },
  });

  // If approved, add extra quota to the user's usage record
  if (finalApprovedAmount && finalApprovedAmount > 0) {
    await (prisma as any).userChatUsage.upsert({
      where: { userId: quotaReq.userId },
      create: {
        userId: quotaReq.userId,
        extraQuota: finalApprovedAmount,
        lastResetDate: new Date(),
      },
      update: {
        extraQuota: { increment: finalApprovedAmount },
      },
    });
  }

  return NextResponse.json({ success: true, status: newStatus, approvedAmount: finalApprovedAmount });
}
