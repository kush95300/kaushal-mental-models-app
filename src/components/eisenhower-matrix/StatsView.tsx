"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface StatsViewProps {
  currentDateDisplay: string;
  stats: {
    pending: number;
    completed: number;
    eliminated: number;
    delegated: number;
    total: number;
  };
  dailyWorkload: number;
  maxDailyMinutes: number;
  isOverburdened: boolean;
}

export const StatsView: React.FC<StatsViewProps> = ({
  currentDateDisplay,
  stats,
  dailyWorkload,
  maxDailyMinutes,
  isOverburdened,
}) => {
  const workloadHours = (dailyWorkload / 60).toFixed(1);
  const maxHours = (maxDailyMinutes / 60).toFixed(1);
  const workloadLabel = `Max: ${maxHours}h`;

  const statItems = [
    {
      label: "Todo",
      value: stats.pending,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Done",
      value: stats.completed,
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Eliminated",
      value: stats.eliminated,
      color: "text-rose-500 dark:text-rose-400",
    },
    {
      label: "Delegated",
      value: stats.delegated,
      color: "text-amber-500 dark:text-amber-400",
    },
    {
      label: workloadLabel,
      value: `${workloadHours}h`,
      color: isOverburdened
        ? "text-rose-600 animate-pulse dark:text-rose-400"
        : "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Total",
      value: stats.total,
      color: "text-slate-900 dark:text-white",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white/80 dark:border-slate-800/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Eisenhower Matrix
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            Focus Matrix
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          Master Your{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            Productivity
          </span>
        </h1>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-slate-400/60 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-sm hidden md:block">
          {currentDateDisplay}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl border border-white dark:border-slate-800 shadow-sm"
            >
              <div className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
