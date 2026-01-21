"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Zap,
  Users,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { getAnalyticsData, AnalyticsData } from "@/actions/analytics";
import { useTheme } from "@/hooks/useTheme";

interface AnalyticsDashboardProps {
  workspaceId: number;
}

export function AnalyticsDashboard({ workspaceId }: AnalyticsDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getAnalyticsData(workspaceId);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Activity className="text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Analyzing Performance...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 lg:p-12 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/eisenhower-matrix"
            className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              The Wisdom Lab
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Analytics & Insights
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white dark:border-slate-800 shadow-sm text-slate-500 dark:text-amber-400 hover:scale-110 active:scale-95 transition-all group"
              title="Toggle Theme"
            >
              {mounted && theme === "dark" ? (
                <Sun
                  size={20}
                  className="group-hover:rotate-45 transition-transform"
                />
              ) : (
                <Moon
                  size={20}
                  className="group-hover:-rotate-12 transition-transform"
                />
              )}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
          <KpiCard
            label="Total Completed"
            value={data.summary.totalCompleted}
            icon={<CheckCircle2 size={18} />}
            trend="All time"
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <KpiCard
            label="Active Tasks"
            value={data.summary.totalActive}
            icon={<Activity size={18} />}
            trend="Current"
            color="text-rose-600"
            bg="bg-rose-50"
          />
          <KpiCard
            label="Avg Velocity"
            value={`${data.summary.avgCompletionTime}h`}
            icon={<Zap size={18} />}
            trend="Per Task"
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <KpiCard
            label="Completion Rate"
            value={`${data.summary.completionRate}%`}
            icon={<CheckCircle2 size={18} />}
            trend="Efficiency"
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
              Focus Distribution
            </h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="block text-3xl font-black text-slate-800 dark:text-white">
                  {data.summary.totalActive}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Tasks
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {data.distribution.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {d.name}{" "}
                    <span className="text-slate-400 dark:text-slate-600">
                      ({d.value})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
              Completion Velocity (14 Days)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.velocity}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={mounted && theme === "dark" ? "#1e293b" : "#f1f5f9"}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: mounted && theme === "dark" ? "#64748b" : "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: mounted && theme === "dark" ? "#64748b" : "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        mounted && theme === "dark" ? "#0f172a" : "#ffffff",
                      borderRadius: "12px",
                      border:
                        mounted && theme === "dark"
                          ? "1px solid #1e293b"
                          : "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{
                      fill: mounted && theme === "dark" ? "#1e293b" : "#f8fafc",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Delegation Row */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-amber-500" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Delegation Report
            </h3>
          </div>

          {data.delegation.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <p className="text-sm font-medium text-slate-400">
                No delegated tasks yet. Start delegating to see stats here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.delegation.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
                      {d.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {d.name}
                    </span>
                  </div>
                  <span className="bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-xs font-black text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm">
                    {d.value} tasks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  bg: string;
  color: string;
}

function KpiCard({ label, value, icon, trend, bg, color }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${bg} dark:bg-slate-800 ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
          {trend}
        </span>
      </div>
      <div>
        <span className="text-2xl font-black text-slate-900 dark:text-white block">
          {value}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
          {payload[0].name}
        </p>
        <p className="text-indigo-600 dark:text-indigo-400 font-black">
          {payload[0].value} Tasks
        </p>
      </div>
    );
  }
  return null;
};
