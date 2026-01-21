"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Task } from "@/types/eisenhower";
import { getCalendarGrid, isSameDay } from "@/lib/dateUtils";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = getCalendarGrid(currentDate);

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const currentMonthName = currentDate.toLocaleString("default", {
    month: "long",
  });
  const currentYear = currentDate.getFullYear();

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "DO":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "SCHEDULE":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "DELEGATE":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "ELIMINATE":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDayTasks = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate || task.isDeleted || task.status === "DONE")
        return false;
      // Compare dates ignoring time
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-sm animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-indigo-500" />
            {currentMonthName}{" "}
            <span className="text-slate-300">{currentYear}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200">
        {/* Weekday Headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-slate-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((dayObj, index) => {
          const dayTasks = getDayTasks(dayObj.date);
          const isTodayDate = isSameDay(dayObj.date, new Date());

          return (
            <div
              key={index}
              className={`min-h-[140px] bg-white p-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 ${
                !dayObj.isCurrentMonth
                  ? "bg-slate-50/30 text-slate-300"
                  : "text-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : ""
                  }`}
                >
                  {dayObj.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="flex-grow flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[100px] mt-1">
                {dayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className={`text-left text-[10px] font-bold px-2 py-1.5 rounded-lg border truncate w-full transition-transform hover:scale-[1.02] ${getQuadrantColor(
                      task.quadrant,
                    )}`}
                    title={task.content}
                  >
                    {task.content}
                  </button>
                ))}
                {dayTasks.length === 0 && dayObj.isCurrentMonth && (
                  <div className="flex-grow flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlusButtonStub />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper for consistency
const PlusButtonStub = () => (
  <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-200">
    <span className="text-xs font-bold">+</span>
  </div>
);
