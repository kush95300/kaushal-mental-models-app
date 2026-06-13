/**
 * Anthropic Claude Haiku provider — SERVER ONLY.
 * Uses raw fetch() — no SDK, no client exposure.
 */

const CLAUDE_API_BASE = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5";

export async function streamClaude(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    stream: true,
    system: systemPrompt,
    messages,
  };

  const res = await fetch(CLAUDE_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    const error = new Error(`Claude error ${res.status}: ${err}`);
    (error as any).status = res.status;
    throw error;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "content_block_delta") {
              const token = parsed?.delta?.text ?? "";
              if (token) controller.enqueue(token);
            }
          } catch {
            // skip
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
