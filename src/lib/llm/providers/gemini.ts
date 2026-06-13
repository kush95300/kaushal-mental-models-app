/**
 * Gemini 1.5 Flash provider — SERVER ONLY.
 * Uses raw fetch() — no SDK, no client exposure.
 * API key read only at call time from process.env.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_API_BASE =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

export async function streamGemini(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: messages,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(`${GEMINI_API_BASE}?key=${apiKey}&alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    const error = new Error(`Gemini error ${res.status}: ${err}`);
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
        // Gemini SSE lines start with "data: "
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const token =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            if (token) controller.enqueue(token);
          } catch {
            // skip malformed chunks
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
