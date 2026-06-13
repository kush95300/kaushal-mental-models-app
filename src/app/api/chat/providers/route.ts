/**
 * GET /api/chat/providers
 * Returns only the NAMES of configured LLM providers — never the API keys.
 * Safe to call from the client-side LLMSwitcher component.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { LLMRouter } from "@/lib/llm/router";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = LLMRouter.getAvailableProviders().map((id) => ({
    id,
    label:
      id === "gemini"
        ? "Gemini Flash"
        : id === "openai"
          ? "GPT-4o Mini"
          : "Claude Haiku",
  }));

  return NextResponse.json({ providers });
}
