"use client";

import { useEffect, useState } from "react";
import { LLMProvider, LLMProviderMeta } from "@/types/chat";
import { Cpu } from "lucide-react";

interface LLMSwitcherProps {
  active: LLMProvider | null;
  onChange: (provider: LLMProvider) => void;
  isStreaming: boolean;
}

const LABELS: Record<LLMProvider, string> = {
  gemini: "Gemini Flash",
  openai: "GPT-4o Mini",
  claude: "Claude Haiku",
};

export default function LLMSwitcher({ active, onChange, isStreaming }: LLMSwitcherProps) {
  const [providers, setProviders] = useState<LLMProviderMeta[]>([]);

  useEffect(() => {
    fetch("/api/chat/providers")
      .then((r) => r.json())
      .then((data) => {
        if (data.providers) setProviders(data.providers);
      })
      .catch(() => {});
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 pb-2">
      <Cpu className="w-3 h-3 text-slate-400 flex-shrink-0" />
      <div className="flex gap-1 flex-wrap">
        {providers.map((p) => {
          const isActive = active === p.id || (!active && providers[0]?.id === p.id);
          return (
            <button
              key={p.id}
              onClick={() => !isStreaming && onChange(p.id)}
              disabled={isStreaming}
              title={isStreaming ? "Wait for response to finish" : `Switch to ${p.label}`}
              className={`
                px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-150
                ${providers.length === 1 ? "cursor-default" : "cursor-pointer"}
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }
                ${isStreaming && isActive ? "animate-pulse" : ""}
              `}
            >
              {isStreaming && isActive ? "…" : p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
