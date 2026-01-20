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
}

export const StatsView: React.FC<StatsViewProps> = ({
  currentDateDisplay,
  stats,
}) => {
  const statItems = [
    { label: "Todo", value: stats.pending, color: "text-indigo-600" },
    { label: "Done", value: stats.completed, color: "text-emerald-500" },
    { label: "Eliminated", value: stats.eliminated, color: "text-rose-500" },
    { label: "Delegated", value: stats.delegated, color: "text-amber-500" },
    { label: "Total", value: stats.total, color: "text-slate-900" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Eisenhower Matrix
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            Focus Matrix
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
          Master Your <span className="text-indigo-600">Productivity</span>
        </h1>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-slate-400/60 font-black uppercase tracking-[0.2em] text-sm hidden md:block">
          {currentDateDisplay}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm"
            >
              <div className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
