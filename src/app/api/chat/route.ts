/**
 * POST /api/chat — Streaming AI chat endpoint
 * - Auth guard (401 if not logged in)
 * - Per-minute rate limiting (10 req/min, in-memory)
 * - Per-user daily/weekly quota from DB (ChatQuotaSettings + UserChatUsage)
 * - LLM provider selection + auto-fallback
 * - Streams tokens via Server-Sent Events (text/event-stream)
 * - Increments usage counter after stream completes
 */

import { getSession } from "@/lib/auth";
import { LLMRouter } from "@/lib/llm/router";
import { buildSystemPrompt } from "@/lib/llm/systemPrompt";
import prisma from "@/lib/prisma";
import { ChatAPIRequest } from "@/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // prisma requires nodejs runtime

// ─── Per-minute rate limiter (in-memory, per-user) ───────────────────────────
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// ─── Quota helper ─────────────────────────────────────────────────────────────
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

async function checkAndIncrementQuota(
  userId: number,
): Promise<{ allowed: boolean; used: number; limit: number; period: string }> {
  // Load global settings (create defaults if not exist)
  let settings = await (prisma as any).chatQuotaSettings.findFirst();
  if (!settings) {
    settings = await (prisma as any).chatQuotaSettings.create({
      data: { period: "DAY", defaultLimit: 20 },
    });
  }

  const now = new Date();

  // Upsert usage record
  let usage = await (prisma as any).userChatUsage.findUnique({
    where: { userId },
  });

  if (!usage) {
    usage = await (prisma as any).userChatUsage.create({
      data: { userId, usedToday: 0, usedThisWeek: 0, extraQuota: 0, lastResetDate: now },
    });
  }

  const lastReset = new Date(usage.lastResetDate);

  // Reset counters if period boundary crossed
  let needsReset = false;
  if (settings.period === "DAY" && !isSameDay(lastReset, now)) needsReset = true;
  if (settings.period === "WEEK" && !isSameWeek(lastReset, now)) needsReset = true;

  if (needsReset) {
    usage = await (prisma as any).userChatUsage.update({
      where: { userId },
      data: { usedToday: 0, usedThisWeek: 0, lastResetDate: now },
    });
  }

  const effectiveLimit = settings.defaultLimit + (usage.extraQuota ?? 0);
  const currentUsed = settings.period === "DAY" ? usage.usedToday : usage.usedThisWeek;

  if (currentUsed >= effectiveLimit) {
    return { allowed: false, used: currentUsed, limit: effectiveLimit, period: settings.period };
  }

  // Increment usage
  const updateData =
    settings.period === "DAY"
      ? { usedToday: { increment: 1 } }
      : { usedThisWeek: { increment: 1 } };

  await (prisma as any).userChatUsage.update({ where: { userId }, data: updateData });

  return { allowed: true, used: currentUsed + 1, limit: effectiveLimit, period: settings.period };
}

// ─── SSE writer helper ────────────────────────────────────────────────────────
function sseChunk(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Main POST handler ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Auth
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Rate limit
  const rl = checkRateLimit(session.id);
  if (!rl.allowed) {
    return new Response(
      `data: ${JSON.stringify({ type: "rate_limited", retryAfterMs: rl.retryAfterMs })}\n\n`,
      {
        status: 429,
        headers: {
          "Content-Type": "text/event-stream",
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      },
    );
  }

  // 3. Parse body
  let body: ChatAPIRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { messages, provider, context = "home", workspaceId, botName, language = "english" } = body;

  // 4. Quota check
  const quota = await checkAndIncrementQuota(session.id);
  if (!quota.allowed) {
    return new Response(
      `data: ${JSON.stringify({ type: "quota_exceeded", used: quota.used, limit: quota.limit, period: quota.period })}\n\n`,
      {
        status: 429,
        headers: { "Content-Type": "text/event-stream" },
      },
    );
  }

  // 5. Load user workspaces for system prompt
  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.id },
    select: { id: true, name: true, description: true, color: true },
  });

  const currentDate = new Date().toISOString().split("T")[0];
  const systemPrompt = buildSystemPrompt(
    workspaces as any,
    workspaceId ?? null,
    context,
    currentDate,
    botName,
    language as any,
  );

  // 6. Normalize messages for LLM (strip client-only fields/placeholders, keep last 10 pairs)
  const UI_PLACEHOLDERS = ["WORKSPACE_CHOOSER", "TUTORIAL_LINKS", "FAQ_LINK"];
  const normalized = messages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        !UI_PLACEHOLDERS.includes(m.content) &&
        !m.content.startsWith("To add this task") &&
        !m.content.startsWith("To add these tasks")
    )
    .slice(-20) // last 10 pairs = 20 messages
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // 7. Stream from LLM
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { stream: llmStream } = await LLMRouter.callWithFallback(
          systemPrompt,
          normalized,
          provider,
        );

        const reader = llmStream.getReader();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += value;
          // Stream token to client
          controller.enqueue(sseChunk({ type: "token", token: value }));
        }

        // Parse the complete JSON response
        let parsed: any = null;
        try {
          // Find the JSON object in the accumulated string
          const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = { mode: "answer", reply: accumulated, confused: false, proposedTasks: [] };
        }

        controller.enqueue(sseChunk({ type: "done", result: parsed }));
        controller.close();
      } catch (err: any) {
        controller.enqueue(sseChunk({ type: "error", error: err.message ?? "LLM error" }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
