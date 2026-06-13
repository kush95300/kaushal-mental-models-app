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
import { PageTutorial, TutorialStep } from "@/components/tour/PageTutorial";
import { getCurrentUser } from "@/actions/auth";

interface AnalyticsDashboardProps {
  workspaceId: number;
}

export function AnalyticsDashboard({ workspaceId }: AnalyticsDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPageTutorial, setShowPageTutorial] = useState(false);
  const [username, setUsername] = useState("guest");
  const [heatmapRange, setHeatmapRange] = useState<"lastYear" | "thisYear">("lastYear");

  const TUTORIAL_STEPS: TutorialStep[] = [
    {
      selector: "#analytics-kpis",
      title: "Key Performance Indicators",
      description: "Review total task completion count, active tasks, average velocity, and efficiency ratios.",
      position: "bottom"
    },
    {
      selector: "#analytics-heatmap",
      title: "Task Completion Heatmap",
      description: "A GitHub-style calendar board tracking your completed tasks per day over the past year.",
      position: "bottom"
    },
    {
      selector: "#analytics-distribution",
      title: "Focus Distribution",
      description: "A pie-chart breakdown showing where your cognitive efforts are distributed across Eisenhower quadrants.",
      position: "right"
    },
    {
      selector: "#analytics-velocity",
      title: "Completion Velocity",
      description: "A bar chart representing your completion trend over the past 14 days.",
      position: "left"
    },
    {
      selector: "#analytics-delegation",
      title: "Delegation Report",
      description: "Aggregated workload sharing metrics showing task counts distributed per team member.",
      position: "top"
    }
  ];

  useEffect(() => {
    setMounted(true);
    getCurrentUser().then((res) => {
      const activeUser = res.success && res.user ? res.user.username : "guest";
      setUsername(activeUser);
      
      const params = new URLSearchParams(window.location.search);
      const forceTutorial = params.get("tutorial") === "true";

      if (forceTutorial) {
        localStorage.removeItem(`tutorial_dismissed_analytics_${activeUser}`);
        setShowPageTutorial(true);
      } else {
        const dismissed = localStorage.getItem(`tutorial_dismissed_analytics_${activeUser}`);
        if (!dismissed) {
          setShowPageTutorial(true);
        }
      }
    });
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

  const calendarDays = React.useMemo(() => {
    if (!data?.contributionCalendar) return [];
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start: Date;
    let end: Date;

    if (heatmapRange === "thisYear") {
      const currentYear = today.getFullYear();
      start = new Date(currentYear, 0, 1);
      end = new Date(currentYear, 11, 31);
    } else {
      start = new Date(today);
      start.setDate(start.getDate() - 375);
      end = new Date(today);
    }
    
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    
    const current = new Date(start);
    while (current <= end) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const match = data.contributionCalendar.find(item => item.date === dateStr);
      const count = match ? match.count : 0;
      
      days.push({
        date: new Date(current),
        dateStr,
        count,
        dayOfWeek: current.getDay(),
        month: current.getMonth(),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [data, heatmapRange]);

  const weeks = React.useMemo(() => {
    const list: any[][] = [];
    let currentWeek: any[] = [];
    calendarDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendarDays.length - 1) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        list.push(currentWeek);
        currentWeek = [];
      }
    });
    return list;
  }, [calendarDays]);

  const months = React.useMemo(() => {
    const monthLabels: { label: string; colSpan: number }[] = [];
    let currentMonth = -1;
    let colSpan = 0;
    
    weeks.forEach((week) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const m = firstDay.date.getMonth();
        if (m !== currentMonth) {
          if (colSpan > 0 && monthLabels.length > 0) {
            monthLabels[monthLabels.length - 1].colSpan = colSpan;
          }
          const label = firstDay.date.toLocaleDateString("en-US", { month: "short" });
          monthLabels.push({ label, colSpan: 0 });
          currentMonth = m;
          colSpan = 0;
        }
      }
      colSpan++;
    });
    if (monthLabels.length > 0 && colSpan > 0) {
      monthLabels[monthLabels.length - 1].colSpan = colSpan;
    }
    return monthLabels;
  }, [weeks]);

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 lg:p-12 font-sans text-slate-900 dark:text-slate-100 transition-colors relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href={`/eisenhower-matrix?workspaceId=${workspaceId}`}
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
        <div id="analytics-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
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

        {/* Contribution Calendar */}
        <div id="analytics-heatmap" className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Completed Tasks Heatmap
            </h3>
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/55 dark:border-slate-750/60 shadow-inner">
              <button
                onClick={() => setHeatmapRange("lastYear")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-155 ${
                  heatmapRange === "lastYear"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Last 1 Year
              </button>
              <button
                onClick={() => setHeatmapRange("thisYear")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-155 ${
                  heatmapRange === "thisYear"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                This Year
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[720px] pr-2">
              {/* Months */}
              <div className="flex gap-[3px] text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1.5 select-none font-sans">
                {months.map((m, idx) => (
                  <div key={idx} style={{ width: `${m.colSpan * 13}px` }} className="truncate">
                    {m.label}
                  </div>
                ))}
              </div>
              
              {/* Heatmap Grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] select-none py-1 relative">
                {weeks.map((week, wIdx) => 
                  week.map((day, dIdx) => {
                    if (!day) return <div key={`empty-${wIdx}-${dIdx}`} className="w-[10px] h-[10px] bg-transparent" />;
                    
                    let colorClass = "bg-slate-100 dark:bg-slate-800/80 hover:ring-2 hover:ring-indigo-400";
                    if (day.count === 1 || day.count === 2) {
                      colorClass = "bg-indigo-200 dark:bg-indigo-900/40 hover:ring-2 hover:ring-indigo-400";
                    } else if (day.count === 3 || day.count === 4) {
                      colorClass = "bg-indigo-400 dark:bg-indigo-600 hover:ring-2 hover:ring-indigo-300";
                    } else if (day.count >= 5) {
                      colorClass = "bg-indigo-600 dark:bg-indigo-400 hover:ring-2 hover:ring-indigo-200";
                    }
                    
                    return (
                      <div key={day.dateStr} className="relative group/day">
                        <div
                          className={`w-[10px] h-[10px] rounded-[2px] transition-all duration-150 cursor-pointer ${colorClass}`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/day:flex flex-col items-center z-[100] bg-slate-900 dark:bg-slate-800 text-white rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700/50 pointer-events-none select-none">
                          <span className="text-[10px] font-black leading-none whitespace-nowrap">
                            {day.count} task{day.count !== 1 ? 's' : ''} completed
                          </span>
                          <span className="text-[8px] font-medium text-slate-400 mt-1.5 whitespace-nowrap">
                            {day.date.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Legend & Details */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60">
                <div className="flex gap-4 items-center">
                  <span>Less</span>
                  <div className="flex gap-[3px]">
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-slate-800" title="0 completed" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-200 dark:bg-indigo-900/40" title="1-2 completed" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-400 dark:bg-indigo-600" title="3-4 completed" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-600 dark:bg-indigo-400" title="5+ completed" />
                  </div>
                  <span>More</span>
                </div>
                <div>Yearly Activity Tracker</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribution */}
          <div id="analytics-distribution" className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
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
          <div id="analytics-velocity" className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
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
        <div id="analytics-delegation" className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
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

      {showPageTutorial && (
        <PageTutorial
          pageKey="analytics"
          steps={TUTORIAL_STEPS}
          onClose={() => setShowPageTutorial(false)}
          onDontShowAgain={(val) => {
            if (val) {
              localStorage.setItem(`tutorial_dismissed_analytics_${username}`, "true");
            } else {
              localStorage.removeItem(`tutorial_dismissed_analytics_${username}`);
            }
          }}
        />
      )}
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
