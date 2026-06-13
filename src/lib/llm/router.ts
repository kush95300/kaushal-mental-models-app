/**
 * LLMRouter — SERVER ONLY
 * Detects available providers from env vars.
 * Calls them in priority order: Gemini → OpenAI → Claude.
 * Auto-falls back on rate-limit (429) or server errors (5xx).
 */

import { LLMProvider } from "@/types/chat";
import { streamGemini } from "./providers/gemini";
import { streamOpenAI } from "./providers/openai";
import { streamClaude } from "./providers/claude";

/** Map message roles to each provider's expected role format */
type NormalizedMessage = { role: "user" | "assistant"; content: string };

export class LLMRouter {
  /**
   * Returns the ordered list of providers that have keys configured.
   * Safe to call from an API route — reads process.env, never sends to client.
   */
  static getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];
    if (process.env.GEMINI_API_KEY) providers.push("gemini");
    if (process.env.OPENAI_API_KEY) providers.push("openai");
    if (process.env.ANTHROPIC_API_KEY) providers.push("claude");
    return providers;
  }

  /**
   * Calls the preferred provider first, then falls back through the list.
   * Throws only if ALL available providers fail.
   */
  static async callWithFallback(
    systemPrompt: string,
    messages: NormalizedMessage[],
    preferredProvider?: LLMProvider,
  ): Promise<{ stream: ReadableStream<string>; usedProvider: LLMProvider }> {
    if (preferredProvider) {
      if (preferredProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.");
      }
      if (preferredProvider === "openai" && !process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.");
      }
      if (preferredProvider === "claude" && !process.env.ANTHROPIC_API_KEY) {
        throw new Error("Claude API key is not configured. Please set ANTHROPIC_API_KEY in your environment variables.");
      }
    }

    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error("No LLM providers are configured. Please add GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to your environment variables.");
    }

    // Re-order so preferred is first
    let ordered = available;
    if (preferredProvider && available.includes(preferredProvider)) {
      ordered = [
        preferredProvider,
        ...available.filter((p) => p !== preferredProvider),
      ];
    }

    let lastError: Error | null = null;

    for (const provider of ordered) {
      try {
        const stream = await this.callProvider(provider, systemPrompt, messages);
        return { stream, usedProvider: provider };
      } catch (err: any) {
        lastError = err;
        const status = err?.status ?? 0;
        // Only fall back on rate-limit or server errors
        if (status === 429 || status >= 500) {
          console.warn(`[LLMRouter] ${provider} returned ${status}, trying next provider...`);
          continue;
        }
        // Auth or config errors — no point retrying other providers for same issue
        throw err;
      }
    }

    throw lastError ?? new Error("All LLM providers failed");
  }

  private static async callProvider(
    provider: LLMProvider,
    systemPrompt: string,
    messages: NormalizedMessage[],
  ): Promise<ReadableStream<string>> {
    switch (provider) {
      case "gemini": {
        // Gemini uses "user"/"model" roles
        const geminiMessages = messages.map((m) => ({
          role: m.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: m.content }],
        }));
        return streamGemini(systemPrompt, geminiMessages);
      }
      case "openai":
        return streamOpenAI(systemPrompt, messages);
      case "claude":
        return streamClaude(systemPrompt, messages);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
