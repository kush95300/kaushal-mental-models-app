"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Task } from "@/types/eisenhower";
import { getCalendarGrid, isSameDay } from "@/lib/dateUtils";
import { Tooltip } from "../ui/Tooltip";

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
  const [viewType, setViewType] = useState<"month" | "week">("month");

  useEffect(() => {
    const handleResize = () => {
      setViewType(window.innerWidth < 768 ? "week" : "month");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day; // adjust when day is Sunday
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const days = React.useMemo(() => {
    if (viewType === "week") {
      const start = getStartOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() };
      });
    }
    return getCalendarGrid(currentDate);
  }, [currentDate, viewType]);

  const navigatePrev = () => {
    if (viewType === "week") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7),
      );
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    }
  };

  const navigateNext = () => {
    if (viewType === "week") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7),
      );
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    }
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
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-white/50 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 sm:w-8 h-8 text-indigo-500" />
            {currentMonthName}{" "}
            <span className="text-slate-350 dark:text-slate-600">{currentYear}</span>
          </h2>
          {/* Toggle buttons (Month / Week) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 items-center">
            <button
              onClick={() => setViewType("month")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewType === "month"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType("week")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewType === "week"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Week
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Tooltip
            content={viewType === "week" ? "Previous Week" : "Previous Month"}
            align="right"
          >
            <button
              onClick={navigatePrev}
              className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
          </Tooltip>
          <Tooltip
            content="Today: Return the calendar view to highlight today's date."
            align="right"
          >
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer"
            >
              Today
            </button>
          </Tooltip>
          <Tooltip
            content={viewType === "week" ? "Next Week" : "Next Month"}
            align="right"
          >
            <button
              onClick={navigateNext}
              className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Weekday Headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-4 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"
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
              className={`bg-white dark:bg-slate-900 p-2 sm:p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-1 sm:gap-2 ${
                viewType === "week"
                  ? "min-h-[100px] sm:min-h-[140px]"
                  : "min-h-[85px] sm:min-h-[140px]"
              } ${
                !dayObj.isCurrentMonth
                  ? "bg-slate-50/30 dark:bg-slate-950/20 text-slate-400 dark:text-slate-700"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-250 dark:shadow-none"
                      : ""
                  }`}
                >
                  {dayObj.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 sm:px-1.5 py-0.5 rounded-md">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="flex-grow flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[100px] mt-1">
                {dayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className={`text-left text-[9px] sm:text-[10px] font-bold px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg border truncate w-full transition-transform hover:scale-[1.02] cursor-pointer ${getQuadrantColor(
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
