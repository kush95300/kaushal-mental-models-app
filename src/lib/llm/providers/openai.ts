/**
 * OpenAI GPT-4o-mini provider — SERVER ONLY.
 * Uses raw fetch() — no SDK, no client exposure.
 */

const OPENAI_API_BASE = "https://api.openai.com/v1/chat/completions";

export async function streamOpenAI(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const body = {
    model: "gpt-4o-mini",
    stream: true,
    temperature: 0.4,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  };

  const res = await fetch(OPENAI_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    const error = new Error(`OpenAI error ${res.status}: ${err}`);
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
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const token =
              parsed?.choices?.[0]?.delta?.content ?? "";
            if (token) controller.enqueue(token);
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
