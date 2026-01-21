"use client";

import React from "react";
import { Plus } from "lucide-react";

interface MainTaskFormProps {
  newTask: string;
  setNewTask: (val: string) => void;
  newEstimatedMinutes: string;
  setNewEstimatedMinutes: (val: string) => void;
  handleAddTask: (e: React.FormEvent) => void;
}

export const MainTaskForm: React.FC<MainTaskFormProps> = ({
  newTask,
  setNewTask,
  newEstimatedMinutes,
  setNewEstimatedMinutes,
  handleAddTask,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none mb-12 border border-slate-100 dark:border-slate-800 transition-colors">
      <form
        onSubmit={handleAddTask}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="flex-grow flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-100 dark:focus-within:border-indigo-900/50 transition-all">
          <Plus className="text-indigo-400 dark:text-indigo-500 w-5 h-5 flex-shrink-0" />
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAddTask(e as unknown as React.FormEvent);
              }
            }}
            placeholder="What objective are we capturing?"
            className="w-full bg-transparent outline-none font-bold text-sm md:text-base placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-100 dark:focus-within:border-indigo-900/50 transition-all w-full md:w-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/10 transition-all w-20">
            <input
              type="number"
              min="0"
              value={
                Math.floor((parseInt(newEstimatedMinutes) || 0) / 60) || ""
              }
              onChange={(e) => {
                const h = parseInt(e.target.value) || 0;
                const m = (parseInt(newEstimatedMinutes) || 0) % 60;
                setNewEstimatedMinutes(
                  h > 0 || m > 0 ? (h * 60 + m).toString() : "",
                );
              }}
              className="w-full bg-transparent outline-none font-black text-xs text-indigo-600 dark:text-indigo-400 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
              Hours
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 font-bold">
            :
          </span>
          <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/10 transition-all w-20">
            <input
              type="number"
              min="0"
              max="59"
              value={(parseInt(newEstimatedMinutes) || 0) % 60 || ""}
              onChange={(e) => {
                const m = Math.min(59, parseInt(e.target.value) || 0);
                const h = Math.floor((parseInt(newEstimatedMinutes) || 0) / 60);
                setNewEstimatedMinutes(
                  h > 0 || m > 0 ? (h * 60 + m).toString() : "",
                );
              }}
              className="w-full bg-transparent outline-none font-black text-xs text-indigo-600 dark:text-indigo-400 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
              Mins
            </span>
          </div>

          <button
            type="submit"
            disabled={!newTask.trim()}
            className="h-12 px-8 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 ml-2"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};
