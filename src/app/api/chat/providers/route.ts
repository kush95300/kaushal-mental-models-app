/**
 * GET /api/chat/providers
 * Returns only the NAMES of configured LLM providers — never the API keys.
 * Safe to call from the client-side LLMSwitcher component.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { LLMRouter } from "@/lib/llm/router";

export const dynamic = "force-dynamic";

function formatGeminiModel(modelString?: string): string {
  const model = modelString || "gemini-2.5-flash";
  return model
    .split("-")
    .map((word) => {
      if (word.toLowerCase() === "gemini") return "Gemini";
      if (word.toLowerCase() === "lite") return "Lite";
      if (word.toLowerCase() === "pro") return "Pro";
      if (word.toLowerCase() === "flash") return "Flash";
      // Capitalize first letter of version numbers or other strings
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = LLMRouter.getAvailableProviders().map((id) => ({
    id,
    label:
      id === "gemini"
        ? formatGeminiModel(process.env.GEMINI_MODEL)
        : id === "openai"
          ? "GPT-4o Mini"
          : "Claude Haiku",
  }));

  return NextResponse.json({ providers });
}
