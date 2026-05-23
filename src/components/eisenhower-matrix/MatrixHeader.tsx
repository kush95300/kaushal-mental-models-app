"use client";

import React, { useState, useEffect } from "react";
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
  Moon,
  Sun,
  Shield,
  LogOut,
  LogIn,
  Bell,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Task, Workspace, User } from "@/types/eisenhower";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Tooltip } from "../ui/Tooltip";
import { logout, getPendingUsers } from "@/actions/auth";

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
  onManageWorkspaces: () => void;
  user: User | null;
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
  onManageWorkspaces,
  user,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (user?.isAdmin) {
      getPendingUsers().then((res) => {
        if (res.success && res.users) {
          setPendingRequestsCount(res.users.length);
        }
      });
    }
  }, [user]);

  const urgentTasks = tasks.filter(
    (t) => t.isUrgent && t.status !== "DONE" && !t.isDeleted,
  );
  const pendingTasks = tasks.filter((t) => t.status !== "DONE" && !t.isDeleted);

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 relative z-20 hover:z-[9999]">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10 hover:z-[9999]">
        <Tooltip
          content="Return to Models Library: Browse and select other mental models and productivity frameworks."
          align="left"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 font-bold text-xs uppercase tracking-widest transition-all group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
            Back to Models
          </Link>
        </Tooltip>
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSwitch={updateWorkspaceOp}
          onAdd={addWorkspaceOp}
          onManage={onManageWorkspaces}
          isTestMode={isTestMode}
        />

        {/* View Toggle & Theme Toggle */}
        <div className="flex bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-[1.5rem] border border-white dark:border-slate-700 items-center shadow-sm relative z-10 hover:z-[9999]">
          <Tooltip content="Toggle Theme: Switch between Dark Mode and Light Mode.">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-2xl transition-all flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-slate-700 mr-1"
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </Tooltip>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Tooltip content="Matrix View: Display tasks in the classic 4-quadrant Eisenhower Matrix layout.">
            <button
              onClick={() => setViewMode("matrix")}
              className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
                viewMode === "matrix"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-700"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Calendar View: Display tasks organized by their due dates on a monthly calendar grid.">
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
                viewMode === "calendar"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-700"
              }`}
            >
              <CalendarIcon size={18} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end relative z-10 hover:z-[9999]">
        {isTestMode && (
          <Tooltip content="Test Mode Active: Changes made in this mode will not be permanently saved to the database.">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest animate-pulse relative z-10 hover:z-[9999]">
              <Zap size={12} className="fill-amber-500" /> Test Mode
            </div>
          </Tooltip>
        )}
        <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-white dark:border-slate-800 items-center gap-1 shadow-sm transition-colors relative z-10 hover:z-[9999]">
          <Tooltip content="Completed Tasks Archive: View, inspect, or restore tasks that have been marked as finished.">
            <button
              onClick={() => setShowDoneList(true)}
              className="p-2 px-3 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest font-sans"
            >
              <CheckCircle2 size={16} /> Done
              <span className="bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-lg text-[8px]">
                {
                  tasks.filter((t) => t.status === "DONE" && !t.isDeleted)
                    .length
                }
              </span>
            </button>
          </Tooltip>
          <Tooltip content="Eliminated Tasks Archive: View or permanently delete tasks that were moved to the Eliminate quadrant.">
            <button
              onClick={() => setShowDeletedList(true)}
              className="p-2 px-3 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest font-sans"
            >
              <Trash2 size={16} /> Eliminated
              <span className="bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md text-[8px]">
                {tasks.filter((t) => t.isDeleted).length}
              </span>
            </button>
          </Tooltip>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
        <Tooltip content="Eisenhower Matrix Guide: Learn how to effectively use the 4 quadrants to prioritize your workflow.">
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2.5 text-slate-400 dark:text-slate-50 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-md relative z-10 hover:z-[9999]"
          >
            <HelpCircle size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Settings Menu: Configure time management, daily workload limits, and matrix preferences.">
          <button
            onClick={onSettingsClick}
            className={`p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-md relative z-10 hover:z-[9999] ${
              isOverburdened
                ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 hover:text-rose-600"
                : ""
            }`}
          >
            <Settings
              size={18}
              className={isOverburdened ? "animate-pulse" : ""}
            />
          </button>
        </Tooltip>
        {!isTestMode && (
          <Tooltip content="Analytics & Insights: View detailed productivity charts, completion trends, and workload distribution.">
            <Link
              href={`/analytics?workspaceId=${activeWorkspaceId}`}
              className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-md ml-1 relative z-10 hover:z-[9999]"
            >
              <BarChart3 size={18} />
            </Link>
          </Tooltip>
        )}

        {/* Notifications Popover */}
        <div className="relative z-30">
          <Tooltip content="Notifications & Alerts" align="right">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-md relative"
            >
              <Bell size={18} />
              {(pendingRequestsCount > 0 || urgentTasks.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          </Tooltip>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Bell size={16} className="text-indigo-500" /> Notifications
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {user?.isAdmin && pendingRequestsCount > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        New Account Requests
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        {pendingRequestsCount} user(s) waiting for admin
                        approval.
                      </div>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setShowNotifications(false)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase tracking-wider shrink-0 shadow-sm"
                    >
                      Review
                    </Link>
                  </div>
                )}

                {urgentTasks.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl">
                    <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />{" "}
                      Urgent Tasks Pending
                    </div>
                    <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                      {urgentTasks.length} urgent task(s) require immediate
                      attention in this workspace.
                    </div>
                  </div>
                )}

                {pendingTasks.length > 0 && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl">
                    <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Workspace Status
                    </div>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                      {pendingTasks.length} active task(s) remaining to be
                      completed.
                    </div>
                  </div>
                )}

                {(!user?.isAdmin || pendingRequestsCount === 0) &&
                  urgentTasks.length === 0 &&
                  pendingTasks.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      No new notifications. You're all caught up!
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <Tooltip content="Manage Delegates: Add, edit, or remove team members and assignees for your tasks.">
          <button
            onClick={() => setShowDelegateModal(true)}
            className="flex items-center gap-2 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-black text-[10px] uppercase tracking-widest transition-all bg-white/80 dark:bg-slate-900/80 p-2.5 px-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm hover:shadow-md font-sans relative z-10 hover:z-[9999]"
          >
            <UserCog size={14} /> Manage Delegates
          </button>
        </Tooltip>
        <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-white dark:border-slate-800 items-center gap-1 shadow-sm ml-2 transition-colors relative z-10 hover:z-[9999]">
          <Tooltip
            content="Force Refresh: Immediately fetch the latest tasks and delegate data from the database."
            align="right"
          >
            <button
              onClick={() => fetchTasks()}
              className="p-2 px-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest group font-sans"
            >
              <RefreshCcw
                size={14}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
            </button>
          </Tooltip>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <Tooltip
            content="Auto-Refresh Interval: Choose how often the matrix automatically syncs with the database."
            align="right"
          >
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 outline-none cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 font-sans px-1"
            >
              <option value={0} className="dark:bg-slate-900">
                Off
              </option>
              <option value={30} className="dark:bg-slate-900">
                30s
              </option>
              <option value={60} className="dark:bg-slate-900">
                1m
              </option>
              <option value={300} className="dark:bg-slate-900">
                5m
              </option>
            </select>
          </Tooltip>
        </div>
        <Tooltip
          content="Focus Depth Slider: Adjust the maximum number of visible tasks displayed per quadrant to maintain focus."
          align="right"
        >
          <div className="flex items-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-[1.5rem] border border-white dark:border-slate-800 shadow-sm ml-2 transition-colors relative z-10 hover:z-[9999]">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap leading-none mb-1 font-sans">
                Focus Depth
              </span>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {visibleLimit} Items
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={visibleLimit}
              onChange={(e) => setVisibleLimit(parseInt(e.target.value))}
              className="w-24 accent-indigo-600 dark:accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer hover:accent-indigo-50 transition-all"
            />
          </div>
        </Tooltip>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
        <div className="flex items-center gap-1 bg-white/40 dark:bg-slate-900/40 p-1 rounded-2xl border border-white/50 dark:border-slate-800/50 transition-colors relative z-10 hover:z-[9999]">
          <Tooltip
            content="Reset Today's Tasks: Delete all tasks created today to start with a clean slate."
            align="right"
          >
            <button
              onClick={() => resetData("today")}
              className="p-2 px-3 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest font-sans"
            >
              Reset Today
            </button>
          </Tooltip>
          <Tooltip
            content="Reset Workspace: Delete all tasks in the current workspace."
            align="right"
          >
            <button
              onClick={() => resetData("all")}
              className="p-2 px-3 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest font-sans"
            >
              Reset All
            </button>
          </Tooltip>
        </div>

        {user ? (
          <div className="flex bg-white/40 dark:bg-slate-900/40 p-1 rounded-2xl border border-white/50 dark:border-slate-800/50 transition-colors relative z-10 hover:z-[9999] ml-2 items-center gap-1">
            <Tooltip
              content="Sign Out: Securely log out of your account."
              align="right"
            >
              <button
                onClick={() => logout()}
                className="p-2 px-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest font-sans flex items-center gap-1"
              >
                <LogOut size={12} /> Logout
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex bg-white/40 dark:bg-slate-900/40 p-1 rounded-2xl border border-white/50 dark:border-slate-800/50 transition-colors relative z-10 hover:z-[9999] ml-2 items-center gap-1">
            <Tooltip
              content="Sign In: Sign in to save your tasks permanently."
              align="right"
            >
              <Link
                href="/login"
                className="p-2 px-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest font-sans flex items-center gap-1"
              >
                <LogIn size={12} /> Sign In
              </Link>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
