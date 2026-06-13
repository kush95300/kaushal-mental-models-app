/**
 * Gemini 1.5 Flash provider — SERVER ONLY.
 * Uses raw fetch() — no SDK, no client exposure.
 * API key read only at call time from process.env.
 */

export async function streamGemini(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
): Promise<ReadableStream<string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const modelsToTry = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-3.5-flash",
      "gemini-3-flash",
      "gemini-3.1-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ])
  );

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`;
      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      };

      const res = await fetch(`${geminiApiUrl}?key=${apiKey}&alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `Gemini error ${res.status}: ${errText}`;
        try {
          const parsed = JSON.parse(errText);
          const rawMsg = parsed?.error?.message || parsed?.[0]?.error?.message;
          if (rawMsg) {
            if (res.status === 429) {
              errMsg = `Gemini rate limit or quota exceeded: ${rawMsg}. Please try switching to a different LLM provider (OpenAI or Claude) in the settings panel.`;
            } else {
              errMsg = `Gemini: ${rawMsg}`;
            }
          }
        } catch {
          if (res.status === 429) {
            errMsg = "Gemini rate limit or quota exceeded. Please try again in a few seconds, or switch to a different LLM provider (OpenAI or Claude) in the settings panel.";
          }
        }
        const error = new Error(errMsg);
        (error as any).status = res.status;
        throw error;
      }

      console.log(`[Gemini] Successfully started stream with model: ${model}`);

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
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? 0;
      console.warn(`[Gemini] Model ${model} failed with status ${status}. trying next model...`);
      // Retriable codes: 429 (rate limit), 404 (model not found/available on this key), 5xx (server error)
      if (status === 429 || status === 404 || status >= 500) {
        continue;
      }
      // Auth or invalid params — bubble up immediately
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
