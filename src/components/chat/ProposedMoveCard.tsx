"use client";

import { ProposedMove, QuadrantKey } from "@/types/chat";
import { CheckCircle2, XCircle, FolderClosed } from "lucide-react";

interface ProposedMoveCardProps {
  moves: ProposedMove[];
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const QUADRANT_META: Record<QuadrantKey, { label: string; color: string; emoji: string }> = {
  DO_FIRST: { label: "Do First", color: "text-rose-600 dark:text-rose-400", emoji: "🔴" },
  SCHEDULE: { label: "Schedule", color: "text-amber-600 dark:text-amber-400", emoji: "🟡" },
  DELEGATE: { label: "Delegate", color: "text-sky-600 dark:text-sky-400", emoji: "🔵" },
  ELIMINATE: { label: "Eliminate", color: "text-slate-500 dark:text-slate-400", emoji: "⚫" },
  INBOX: { label: "Inbox", color: "text-emerald-600 dark:text-emerald-400", emoji: "📥" },
};

export default function ProposedMoveCard({
  moves,
  onConfirm,
  onCancel,
  isSubmitting,
}: ProposedMoveCardProps) {
  if (moves.length === 0) return null;

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40 flex items-center justify-between">
        <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
          {moves.length} Task Move{moves.length > 1 ? "s" : ""} Proposed
        </span>
        <span className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest">
          Approve to shift
        </span>
      </div>

      {/* Moves list */}
      <div className="divide-y divide-indigo-100/60 dark:divide-indigo-800/30 max-h-[220px] overflow-y-auto">
        {moves.map((move, i) => {
          const q = move.targetQuadrant ? QUADRANT_META[move.targetQuadrant] : null;

          return (
            <div key={i} className="px-4 py-3 flex flex-col gap-1 hover:bg-indigo-100/10 dark:hover:bg-indigo-900/10 transition-colors">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {move.taskTitle}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {q && (
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-100/40 dark:border-indigo-900/40">
                    Move to: <span className={q.color}>{q.emoji} {q.label}</span>
                  </span>
                )}
                {move.targetWorkspace && (
                  <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-lg border border-violet-100/40 dark:border-violet-900/40">
                    <FolderClosed className="w-3.5 h-3.5" />
                    Workspace: {move.targetWorkspace}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-indigo-100 dark:border-indigo-800/40 flex gap-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-500/30 disabled:opacity-60 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isSubmitting ? "Updating…" : `Approve Move${moves.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
