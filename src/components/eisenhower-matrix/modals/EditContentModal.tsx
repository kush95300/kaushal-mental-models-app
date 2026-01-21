"use client";

import React from "react";

interface EditContentModalProps {
  editingContentTaskId: number | null;
  editingContentValue: string;
  setEditingContentValue: (value: string) => void;
  editingEstimatedMinutes: string;
  setEditingEstimatedMinutes: (value: string) => void;
  onClose: () => void;
  saveTaskContent: () => void;
  warningMessage?: string | null;
}

export const EditContentModal: React.FC<EditContentModalProps> = ({
  editingContentTaskId,
  editingContentValue,
  setEditingContentValue,
  editingEstimatedMinutes,
  setEditingEstimatedMinutes,
  onClose,
  saveTaskContent,
  warningMessage,
}) => {
  if (editingContentTaskId === null) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 font-display uppercase tracking-tight">
          Edit Task
        </h3>
        {warningMessage && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center gap-2 animate-pulse">
            ⚠️ {warningMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">
              Task Content
            </label>
            <textarea
              value={editingContentValue}
              onChange={(e) => setEditingContentValue(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 min-h-[100px] placeholder:text-slate-400"
              placeholder="Task content..."
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">
              Estimated Duration
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/10 transition-all">
                <input
                  type="number"
                  min="0"
                  value={Math.floor(
                    (parseInt(editingEstimatedMinutes) || 0) / 60,
                  )}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    const m = (parseInt(editingEstimatedMinutes) || 0) % 60;
                    setEditingEstimatedMinutes((h * 60 + m).toString());
                  }}
                  className="w-full bg-transparent outline-none font-black text-2xl text-slate-700 dark:text-slate-200 text-center placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="0"
                />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  HR
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-600 font-bold mb-4">
                :
              </span>
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/10 transition-all">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={(parseInt(editingEstimatedMinutes) || 0) % 60}
                  onChange={(e) => {
                    const h = Math.floor(
                      (parseInt(editingEstimatedMinutes) || 0) / 60,
                    );
                    let m = parseInt(e.target.value) || 0;
                    if (m > 59) m = 59;
                    setEditingEstimatedMinutes((h * 60 + m).toString());
                  }}
                  className="w-full bg-transparent outline-none font-black text-2xl text-slate-700 dark:text-slate-200 text-center placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="0"
                />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  MIN
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={saveTaskContent}
            disabled={!editingContentValue.trim()}
            className="flex-1 py-4 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
