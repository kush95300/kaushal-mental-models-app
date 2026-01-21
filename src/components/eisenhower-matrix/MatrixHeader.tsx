"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  HelpCircle,
  UserCog,
  RefreshCcw,
  Zap,
  Settings,
  LayoutGrid,
  Calendar as CalendarIcon,
  BarChart3,
} from "lucide-react";
import { Task, Workspace } from "@/types/eisenhower";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface MatrixHeaderProps {
  isTestMode: boolean;
  tasks: Task[];
  refreshInterval: number;
  setRefreshInterval: (val: number) => void;
  visibleLimit: number;
  setVisibleLimit: (val: number) => void;
  setShowDoneList: (val: boolean) => void;
  setShowDeletedList: (val: boolean) => void;
  setShowHelpModal: (val: boolean) => void;
  setShowDelegateModal: (val: boolean) => void;
  fetchTasks: () => void;
  resetData: (type: "today" | "all") => void;
  workspaces: Workspace[];
  activeWorkspaceId: number;
  updateWorkspaceOp: (id: number) => void;
  addWorkspaceOp: (name: string, color: string) => void;
  onSettingsClick: () => void;
  isOverburdened: boolean;
  viewMode: "matrix" | "calendar";
  setViewMode: (mode: "matrix" | "calendar") => void;
}

export const MatrixHeader: React.FC<MatrixHeaderProps> = ({
  isTestMode,
  tasks,
  refreshInterval,
  setRefreshInterval,
  visibleLimit,
  setVisibleLimit,
  setShowDoneList,
  setShowDeletedList,
  setShowHelpModal,
  setShowDelegateModal,
  fetchTasks,
  resetData,
  workspaces,
  activeWorkspaceId,
  updateWorkspaceOp,
  addWorkspaceOp,
  onSettingsClick,
  isOverburdened,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group w-fit"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
        Back to Models
      </Link>
      <WorkspaceSwitcher
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitch={updateWorkspaceOp}
        onAdd={addWorkspaceOp}
      />
      <div className="flex bg-white/90 backdrop-blur-sm p-1 rounded-[1.5rem] border border-white items-center shadow-sm mx-4">
        <button
          onClick={() => setViewMode("matrix")}
          className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
            viewMode === "matrix"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
          title="Matrix View"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
            viewMode === "calendar"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
          title="Calendar View"
        >
          <CalendarIcon size={18} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        {isTestMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest mr-2 animate-pulse">
            <Zap size={12} className="fill-amber-500" /> Test Mode
          </div>
        )}
        <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-white items-center gap-1 shadow-sm">
          <button
            onClick={() => setShowDoneList(true)}
            className="p-2 px-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
            title="View Completed Tasks"
          >
            <CheckCircle2 size={16} /> Done
            <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-lg text-[8px]">
              {tasks.filter((t) => t.status === "DONE" && !t.isDeleted).length}
            </span>
          </button>
          <button
            onClick={() => setShowDeletedList(true)}
            className="p-2 px-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
            title="View Eliminated (Deleted) Tasks"
          >
            <Trash2 size={16} /> Eliminated
            <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-md text-[8px]">
              {tasks.filter((t) => t.isDeleted).length}
            </span>
          </button>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2.5 text-slate-400 hover:text-indigo-600 bg-white/80 rounded-2xl border border-white shadow-sm transition-all hover:shadow-md"
          title="How to use the Matrix"
        >
          <HelpCircle size={18} />
        </button>
        <button
          onClick={onSettingsClick}
          className={`p-2.5 text-slate-400 hover:text-indigo-600 bg-white/80 rounded-2xl border border-white shadow-sm transition-all hover:shadow-md ${
            isOverburdened
              ? "border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600"
              : ""
          }`}
          title="Settings & Time Management"
        >
          <Settings
            size={18}
            className={isOverburdened ? "animate-pulse" : ""}
          />
        </button>
        {!isTestMode && (
          <Link
            href="/analytics"
            className="p-2.5 text-slate-400 hover:text-indigo-600 bg-white/80 rounded-2xl border border-white shadow-sm transition-all hover:shadow-md ml-1"
            title="Analytics & Insights"
          >
            <BarChart3 size={18} />
          </Link>
        )}
        <button
          onClick={() => setShowDelegateModal(true)}
          className="flex items-center gap-2 text-amber-500 hover:text-amber-600 font-black text-[10px] uppercase tracking-widest transition-all bg-white/80 p-2.5 px-4 rounded-2xl border border-white shadow-sm hover:shadow-md"
        >
          <UserCog size={14} /> Manage Delegates
        </button>
        <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-white items-center gap-1 shadow-sm ml-2">
          <button
            onClick={() => fetchTasks()}
            className="p-2 px-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest group"
            title="Force Refresh"
          >
            <RefreshCcw
              size={14}
              className="group-hover:rotate-180 transition-transform duration-500"
            />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none cursor-pointer hover:text-indigo-600"
            title="Auto-refresh Interval"
          >
            <option value={0}>Off</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
        </div>
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-[1.5rem] border border-white shadow-sm ml-2">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none mb-1">
              Focus Depth
            </span>
            <span className="text-[10px] font-black text-indigo-600 leading-none">
              {visibleLimit} Items
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={visibleLimit}
            onChange={(e) => setVisibleLimit(parseInt(e.target.value))}
            className="w-24 accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer hover:accent-indigo-500 transition-all"
          />
        </div>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/50">
          <button
            onClick={() => resetData("today")}
            className="p-2 px-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest"
            title="Delete tasks created today"
          >
            Reset Today
          </button>
          <button
            onClick={() => resetData("all")}
            className="p-2 px-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest"
            title="Delete all tasks"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
