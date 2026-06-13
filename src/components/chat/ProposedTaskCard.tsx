"use client";

import { ProposedTask, QuadrantKey } from "@/types/chat";
import { CheckCircle2, XCircle, Clock, User, CalendarDays, ArrowRight } from "lucide-react";

interface ProposedTaskCardProps {
  tasks: ProposedTask[];
  onConfirm: () => void;
  onCancel: () => void;
  onConfirmSingle?: (task: ProposedTask) => void;
  isSubmitting: boolean;
}

const QUADRANT_META: Record<QuadrantKey, { label: string; color: string; emoji: string }> = {
  DO_FIRST: { label: "Do First", color: "text-rose-600 dark:text-rose-400", emoji: "🔴" },
  SCHEDULE: { label: "Schedule", color: "text-amber-600 dark:text-amber-400", emoji: "🟡" },
  DELEGATE: { label: "Delegate", color: "text-sky-600 dark:text-sky-400", emoji: "🔵" },
  ELIMINATE: { label: "Eliminate", color: "text-slate-500 dark:text-slate-400", emoji: "⚫" },
  INBOX: { label: "Inbox", color: "text-emerald-600 dark:text-emerald-400", emoji: "📥" },
};

function fmt(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function ProposedTaskCard({
  tasks,
  onConfirm,
  onCancel,
  onConfirmSingle,
  isSubmitting,
}: ProposedTaskCardProps) {
  if (tasks.length === 0) return null;

  const mainTasks = tasks.filter((t) => !t.isFollowUp);
  const followUps = tasks.filter((t) => t.isFollowUp);
  const orphanFollowUps = followUps.filter((f) => !mainTasks.some((m) => m.content === f.parentTask));

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
            {tasks.length} Task{tasks.length > 1 ? "s" : ""} Ready to Add
          </span>
        </div>
        <span className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest">
          Review before adding
        </span>
      </div>

      {/* Tasks table */}
      <div className="divide-y divide-indigo-100/60 dark:divide-indigo-800/30 max-h-[220px] overflow-y-auto">
        {mainTasks.map((task, i) => {
          const q = QUADRANT_META[task.quadrant] ?? QUADRANT_META.INBOX;
          const taskFollowUps = followUps.filter((f) => f.parentTask === task.content);

          return (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-indigo-100/10 dark:hover:bg-indigo-900/10 transition-colors">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 leading-snug">
                    {task.content}
                  </span>
                  <span className={`text-xs font-bold whitespace-nowrap ${q.color} flex items-center gap-1`}>
                    {q.emoji} {q.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.delegateName}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {fmt(task.estimatedMinutes)}
                  </span>
                </div>

                {/* Inline nested follow-ups */}
                {taskFollowUps.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-amber-300 dark:border-amber-700/60 space-y-1">
                    {taskFollowUps.map((fu, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {fu.content} <span className="text-[10px] text-slate-400/80">({fmt(fu.estimatedMinutes)} · Follow-up)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Individual task approve button */}
              {tasks.length > 1 && onConfirmSingle && (
                <button
                  onClick={() => onConfirmSingle(task)}
                  disabled={isSubmitting}
                  title="Approve this task"
                  className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {orphanFollowUps.length > 0 && (
          <>
            <div className="px-4 py-1.5 bg-amber-50/80 dark:bg-amber-950/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Orphan follow-ups
              </span>
            </div>
            {orphanFollowUps.map((task, i) => (
              <div key={`fu-${i}`} className="px-4 py-2.5 flex items-center gap-2 bg-amber-50/50 dark:bg-amber-950/10">
                <ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">
                  {task.content}
                </span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {fmt(task.estimatedMinutes)} · Self
                </span>
              </div>
            ))}
          </>
        )}
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
          {isSubmitting ? "Adding…" : `Add All ${tasks.length} Tasks to Matrix`}
        </button>
      </div>
    </div>
  );
}
