"use client";

import React from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Task } from "@/types/eisenhower";

interface DoneListModalProps {
  tasks: Task[];
  onClose: () => void;
  toggleComplete: (taskId: number) => void;
}

export const DoneListModal: React.FC<DoneListModalProps> = ({
  tasks,
  onClose,
  toggleComplete,
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
          <CheckCircle2 className="text-emerald-500" /> Done Archive
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          <X size={20} className="text-slate-400 dark:text-slate-500" />
        </button>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 font-sans">
        {tasks.filter((t) => t.status === "DONE" && !t.isDeleted).length ===
        0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
            No completed items.
          </p>
        ) : (
          tasks
            .filter((t) => t.status === "DONE" && !t.isDeleted)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 line-through opacity-50">
                  {task.content}
                </span>
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-md transition-all font-sans"
                >
                  Restore to TODO
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  </div>
);
