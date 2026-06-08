"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, X, LogIn, Sparkles, Pencil, Check } from "lucide-react";
import { ChatMessage, LLMProvider, ProposedTask, LLMStructuredResponse, QuotaStatus } from "@/types/chat";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import LLMSwitcher from "./LLMSwitcher";
import SuggestedPrompts from "./SuggestedPrompts";
import ProposedTaskCard from "./ProposedTaskCard";
import QuotaRequestModal from "./QuotaRequestModal";

interface AiChatbotProps {
  context: "home" | "matrix";
  workspaceId?: number;
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AiChatbot({ context, workspaceId }: AiChatbotProps) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ id: number; username: string } | null | "loading">("loading");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(null);

  const [proposedTasks, setProposedTasks] = useState<ProposedTask[]>([]);
  const [isSubmittingTasks, setIsSubmittingTasks] = useState(false);

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);

  // ── Bot name — default "Betu", persisted in localStorage ─────────────────────
  const [botName, setBotName] = useState("Betu");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Auth check on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data?.user ?? null))
      .catch(() => setSession(null));
  }, []);

  // ── Load bot name from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("chatbot_name");
    if (saved && saved.trim()) setBotName(saved.trim());
  }, []);

  // ── Rename helpers ────────────────────────────────────────────────────────────
  const startRenaming = () => {
    setRenameInput(botName);
    setIsRenaming(true);
    setTimeout(() => renameRef.current?.select(), 50);
  };

  const confirmRename = () => {
    const trimmed = renameInput.trim();
    if (trimmed) {
      setBotName(trimmed);
      localStorage.setItem("chatbot_name", trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirmRename();
    if (e.key === "Escape") setIsRenaming(false);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMsgId = uuid();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);
    setProposedTasks([]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          provider: activeProvider ?? undefined,
          context,
          workspaceId,
          botName,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const chunk = JSON.parse(jsonStr);

            if (chunk.type === "quota_exceeded") {
              setQuotaExceeded(true);
              setQuotaStatus({ used: chunk.used, limit: chunk.limit, period: chunk.period, exhausted: true });
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: `You've reached your ${chunk.period.toLowerCase()} message limit (${chunk.used}/${chunk.limit}). Request more from your admin.`, isStreaming: false }
                    : m,
                ),
              );
              break;
            }

            if (chunk.type === "rate_limited") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: "You're sending messages too fast. Please wait a moment and try again.", isStreaming: false }
                    : m,
                ),
              );
              break;
            }

            if (chunk.type === "token" && chunk.token) {
              accumulated += chunk.token;
              // Show readable text while streaming (strip JSON structure for display)
              const displayText = extractReply(accumulated) || accumulated;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: displayText } : m,
                ),
              );
            }

            if (chunk.type === "done" && chunk.result) {
              const result: LLMStructuredResponse = chunk.result;
              const finalReply = result.confused
                ? (result.clarificationQuestion ?? result.reply)
                : result.reply;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: finalReply, isStreaming: false } : m,
                ),
              );

              if (result.proposedTasks?.length > 0) {
                setProposedTasks(result.proposedTasks);
              }
            }

            if (chunk.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: "Sorry, something went wrong. Please try again.", isStreaming: false }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed SSE chunk
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: "Connection error. Please check your network and try again.", isStreaming: false }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) => prev.map((m) => ({ ...m, isStreaming: false })));
    }
  }, [input, isStreaming, messages, activeProvider, context, workspaceId, botName]);

  // ── Add tasks to matrix ──────────────────────────────────────────────────────
  const addTasksToMatrix = useCallback(async () => {
    if (!proposedTasks.length) return;
    setIsSubmittingTasks(true);

    try {
      // Resolve delegate IDs for each task
      for (const task of proposedTasks) {
        const wsId = workspaceId ?? 1;

        let delegateId: number | null = null;

        if (task.delegateName && task.delegateName.toLowerCase() !== "self") {
          // Fetch existing delegates first to avoid duplicate creation
          const existingRes = await fetch(`/api/delegates?workspaceId=${wsId}`);
          if (existingRes.ok) {
            const existingList: any[] = await existingRes.json();
            const found = existingList.find(
              (d) => d.name.toLowerCase() === task.delegateName.toLowerCase(),
            );
            if (found) {
              delegateId = found.id;
            } else {
              // Create new delegate
              const delRes = await fetch("/api/delegates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: task.delegateName, workspaceId: wsId }),
              });
              if (delRes.ok) {
                const delData = await delRes.json();
                delegateId = delData.id;
              }
            }
          }
        }

        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: task.content,
            isImportant: task.isImportant,
            isUrgent: task.isUrgent,
            quadrant: task.quadrant,
            dueDate: task.dueDate,
            delegateId,
            estimatedMinutes: task.estimatedMinutes,
            workspaceId: wsId,
          }),
        });
      }

      setProposedTasks([]);
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: `✅ Added ${proposedTasks.length} task${proposedTasks.length > 1 ? "s" : ""} to your matrix! Check your board to review them.`,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: "There was an error adding the tasks. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmittingTasks(false);
    }
  }, [proposedTasks, workspaceId]);

  // ── Unauthenticated state ────────────────────────────────────────────────────
  if (session === "loading") return null;

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          id="ai-chatbot-trigger"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[45000] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
          title="Open AI Tasker"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[45000] w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-3rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {isRenaming ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={renameRef}
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value.slice(0, 24))}
                      onKeyDown={handleRenameKey}
                      onBlur={confirmRename}
                      maxLength={24}
                      className="bg-white/20 text-white placeholder-white/50 text-sm font-black rounded-lg px-2 py-0.5 w-full max-w-[130px] focus:outline-none focus:ring-2 focus:ring-white/40"
                      placeholder="Enter name…"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); confirmRename(); }}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
                      title="Save name"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/name">
                    <h2 className="text-sm font-black text-white leading-none truncate">{botName}</h2>
                    <button
                      onClick={startRenaming}
                      className="opacity-0 group-hover/name:opacity-100 p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-all duration-150 flex-shrink-0"
                      title="Rename chatbot"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-white/70 mt-0.5">AI Productivity Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <button
                onClick={() => setOpen(false)}
                className="ml-2 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimise"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unauthenticated gate */}
          {!session ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 mb-1">Sign in to use {botName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The AI Tasker is available after login to keep your data secure.
                </p>
              </div>
              <a
                href="/login"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl transition-colors shadow-sm shadow-indigo-500/30"
              >
                Sign In
              </a>
            </div>
          ) : (
            <>
              {/* LLM provider switcher */}
              <div className="pt-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <LLMSwitcher
                  active={activeProvider}
                  onChange={setActiveProvider}
                  isStreaming={isStreaming}
                />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="px-5 py-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Hi{session.username ? `, ${session.username}` : ""}! I'm {botName}.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tell me what to do, ask about mental models, or use your mic 🎤
                      </p>
                    </div>
                    <SuggestedPrompts onSelect={(p) => { setInput(p); }} context={context} />
                  </div>
                ) : (
                  <ChatWindow messages={messages} />
                )}
              </div>

              {/* Proposed task confirmation */}
              {proposedTasks.length > 0 && (
                <ProposedTaskCard
                  tasks={proposedTasks}
                  onConfirm={addTasksToMatrix}
                  onCancel={() => setProposedTasks([])}
                  isSubmitting={isSubmittingTasks}
                />
              )}

              {/* Input */}
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                disabled={isStreaming || isSubmittingTasks}
                silenceTimeoutMs={2500}
                autoSubmitAfterSilence={false}
                botName={botName}
              />
            </>
          )}
        </div>
      )}

      {/* Quota exceeded modal */}
      {quotaExceeded && quotaStatus && (
        <QuotaRequestModal
          used={quotaStatus.used}
          limit={quotaStatus.limit}
          period={quotaStatus.period}
          onClose={() => setQuotaExceeded(false)}
        />
      )}
    </>
  );
}

/** Extract the "reply" field from a partially-streamed JSON string */
function extractReply(text: string): string {
  try {
    const match = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match) return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  } catch {}
  return "";
}
