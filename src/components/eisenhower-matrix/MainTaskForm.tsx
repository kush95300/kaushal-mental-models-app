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
    <div className="bg-white p-4 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-12 border border-slate-100">
      <form
        onSubmit={handleAddTask}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="flex-grow flex items-center gap-3 bg-slate-50 p-4 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-100 transition-all">
          <Plus className="text-indigo-400 w-5 h-5 flex-shrink-0" />
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What objective are we capturing?"
            className="w-full bg-transparent outline-none font-bold text-sm md:text-base placeholder:text-slate-300"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-100 transition-all w-full md:w-auto">
          <div className="bg-white rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-20">
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
              className="w-full bg-transparent outline-none font-black text-xs text-indigo-600 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">
              Hours
            </span>
          </div>
          <span className="text-slate-300 font-bold">:</span>
          <div className="bg-white rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-20">
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
              className="w-full bg-transparent outline-none font-black text-xs text-indigo-600 text-center"
              placeholder="0"
            />
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">
              Mins
            </span>
          </div>

          <button
            type="submit"
            disabled={!newTask.trim()}
            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 ml-2"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};
