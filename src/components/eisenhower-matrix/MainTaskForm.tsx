"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

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
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <form onSubmit={handleAddTask} className="relative group">
        <div className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-[2rem] border border-white dark:border-slate-800 shadow-lg shadow-indigo-100/20 dark:shadow-none transition-all group-hover:shadow-xl group-hover:bg-white dark:group-hover:bg-slate-900">
          <div className="p-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <Plus size={20} className="w-5 h-5 stroke-[2.5]" />
          </div>

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task... (Press Enter to quick-add)"
            className="flex-grow bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm font-medium px-2 font-sans"
          />

          {/* Time Estimate Input */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-700/50 mr-2">
            <input
              type="number"
              min="0"
              max="24"
              value={
                Math.floor((parseInt(newEstimatedMinutes) || 0) / 60) || ""
              }
              onChange={(e) => {
                const h = Math.min(24, parseInt(e.target.value) || 0);
                const m = (parseInt(newEstimatedMinutes) || 0) % 60;
                setNewEstimatedMinutes(
                  h > 0 || m > 0 ? (h * 60 + m).toString() : "",
                );
              }}
              className="w-10 bg-transparent outline-none font-black text-xs text-indigo-600 dark:text-indigo-400 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
              Hrs
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-black text-xs">
              :
            </span>
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
              className="w-10 bg-transparent outline-none font-black text-xs text-indigo-600 dark:text-indigo-400 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
              Mins
            </span>
          </div>

          <Tooltip
            content="Add Task: Quickly add this task to your Draft Queue (Inbox) for later categorization."
            position="top"
            align="right"
          >
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="h-12 px-8 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 ml-2"
            >
              Add Task
            </button>
          </Tooltip>
        </div>
      </form>
    </div>
  );
};
