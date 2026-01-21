"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";
import { Task } from "@/types/eisenhower";

interface DeletedListModalProps {
  tasks: Task[];
  onClose: () => void;
  revertDeletion: (taskId: number) => void;
  hardDeleteTask: (taskId: number) => void;
}

export const DeletedListModal: React.FC<DeletedListModalProps> = ({
  tasks,
  onClose,
  revertDeletion,
  hardDeleteTask,
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
          <Trash2 className="text-rose-500" /> Eliminated Archive
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          <X size={20} className="text-slate-400 dark:text-slate-500" />
        </button>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 font-sans">
        {tasks.filter((t) => t.isDeleted).length === 0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
            No eliminated tasks.
          </p>
        ) : (
          tasks
            .filter((t) => t.isDeleted)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {task.content}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => revertDeletion(task.id)}
                    className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                  >
                    Revert
                  </button>
                  <button
                    onClick={() => hardDeleteTask(task.id)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 text-rose-500 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-sans"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  </div>
);
