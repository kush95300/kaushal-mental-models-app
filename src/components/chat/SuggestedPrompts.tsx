"use client";

import { LLMProvider } from "@/types/chat";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  context: "home" | "matrix";
}

const PROMPTS: { emoji: string; text: string; type: "task" | "qa" }[] = [
  { emoji: "🗓️", text: "Schedule a 5-hour report for my personal workspace by Friday", type: "task" },
  { emoji: "👥", text: "Ask Riya to prepare the client deck by tomorrow", type: "task" },
  { emoji: "⚡", text: "Urgent: Fix login bug in work workspace right now", type: "task" },
  { emoji: "📥", text: "Add task: Read ML research paper someday", type: "task" },
  { emoji: "🧠", text: "What is the Eisenhower Matrix?", type: "qa" },
  { emoji: "🤔", text: "When should I delegate vs. eliminate a task?", type: "qa" },
  { emoji: "⏱️", text: "What mental model helps with time management?", type: "qa" },
  { emoji: "💡", text: "How do I add tasks using voice?", type: "qa" },
];

export default function SuggestedPrompts({ onSelect, context }: SuggestedPromptsProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Try asking…
      </p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p.text}
            onClick={() => onSelect(p.text)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              border transition-all duration-150 hover:scale-[1.02] active:scale-95
              ${
                p.type === "task"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                  : "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40"
              }
            `}
          >
            <span>{p.emoji}</span>
            <span className="line-clamp-1 max-w-[160px]">{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
