"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ResetConfirmModalProps {
  isOpen: boolean;
  resetType: "today" | "all" | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  resetType,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !resetType) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors">
        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 font-display uppercase tracking-tight">
          {resetType === "today" ? "Reset Today's Tasks" : "Reset Workspace Tasks"}
        </h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 font-sans leading-relaxed">
          {resetType === "today"
            ? "Are you sure you want to permanently delete all tasks created today? This action cannot be undone and will clear your daily progress."
            : "Are you sure you want to permanently delete ALL tasks in the current workspace? This action cannot be undone."}
        </p>

        <div className="flex gap-2 font-sans">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl bg-rose-500 dark:bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
};
