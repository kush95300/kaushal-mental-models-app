"use client";

import React from "react";
import { X } from "lucide-react";
import { Task } from "@/types/eisenhower";

interface DatePickerModalProps {
  editingDateTaskId: number | null;
  tasks: Task[];
  onClose: () => void;
  updateTaskQuadrant: (
    taskId: number,
    quadrant: string,
    updates: Partial<Task>,
  ) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  editingDateTaskId,
  tasks,
  onClose,
  updateTaskQuadrant,
}) => {
  if (editingDateTaskId === null) return null;
  const task = tasks.find((t) => t.id === editingDateTaskId);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-black text-slate-900">Set Due Date</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-slate-700"
            onChange={(e) => {
              if (e.target.value && task) {
                updateTaskQuadrant(editingDateTaskId, task.quadrant, {
                  dueDate: new Date(e.target.value).toISOString(),
                });
                onClose();
              }
            }}
          />
          <button
            onClick={() => {
              if (task) {
                updateTaskQuadrant(editingDateTaskId, task.quadrant, {
                  dueDate: null,
                });
              }
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Clear Date
          </button>
        </div>
      </div>
    </div>
  );
};
