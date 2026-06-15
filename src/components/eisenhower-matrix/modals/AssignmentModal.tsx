"use client";

import React from "react";
import {
  X,
  Users,
  UserPlus,
  Target,
  Flame,
  Calendar,
  Trash2,
  Inbox,
} from "lucide-react";
import { Task, Delegate } from "@/types/eisenhower";

interface AssignmentModalProps {
  assignmentModal: { taskId: number; quadrant: string } | null;
  tasks: Task[];
  delegates: Delegate[];
  onClose: () => void;
  updateTaskQuadrant: (
    taskId: number,
    quadrant: string,
    updates: Partial<Task>,
  ) => void;
  setShowDelegateModal: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setAssignmentModal?: (
    data: { taskId: number; quadrant: string } | null,
  ) => void;
  workspaces?: any[];
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  assignmentModal,
  tasks,
  delegates,
  onClose,
  updateTaskQuadrant,
  setShowDelegateModal,
  setAssignmentModal,
  workspaces = [],
}) => {
  if (!assignmentModal) return null;

  const currentTask = tasks.find((t) => t.id === assignmentModal.taskId);

  return (
    <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {assignmentModal.quadrant === "DELEGATE"
                ? "Delegate Task"
                : assignmentModal.quadrant === "DO"
                  ? "Plan Execution"
                  : assignmentModal.quadrant === "SCHEDULE"
                    ? "Schedule Task"
                    : assignmentModal.quadrant === "MOVE"
                      ? "Prioritize / Move Task"
                      : "Confirm Action"}
            </h3>
            <p className="text-sm font-semibold text-indigo-600/70 dark:text-indigo-400/70 italic font-sans truncate max-w-[18rem]">
              &quot;{currentTask?.content}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X size={20} className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          {assignmentModal.quadrant === "DELEGATE" && (
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 font-sans">
                Who should handle this task?
              </p>
              {delegates.filter((d) => d.name !== "Self").length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-center">
                  <p className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase mb-3 font-sans">
                    No team members added yet
                  </p>
                  <button
                    onClick={() => setShowDelegateModal(true)}
                    className="w-full py-4 mb-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-500 transition-all flex items-center justify-center gap-2 font-sans"
                  >
                    <UserPlus size={16} /> Add Team Member
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      updateTaskQuadrant(assignmentModal.taskId, "DO", {
                        dueDate: today.toISOString(),
                      });
                      onClose();
                    }}
                    className="w-full py-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all font-sans"
                  >
                    Keep for Self (Urgent & Important)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {delegates
                    .filter((d) => d.name !== "Self")
                    .map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          updateTaskQuadrant(
                            assignmentModal.taskId,
                            "DELEGATE",
                            { delegateId: d.id },
                          );
                          onClose();
                        }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group font-sans"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:bg-amber-600 transition-all">
                          <Users size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-200">
                            {d.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            Delegate Member
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {assignmentModal.quadrant === "DO" && (
            <div className="grid grid-cols-2 gap-3 font-sans">
              <button
                onClick={() => {
                  const today = new Date();
                  updateTaskQuadrant(assignmentModal.taskId, "DO", {
                    dueDate: today.toISOString(),
                  });
                  onClose();
                }}
                className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all group text-left"
              >
                <span className="block text-xl font-black mb-1 group-hover:text-white text-indigo-900 dark:text-indigo-100">
                  Today
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  High Priority
                </span>
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  updateTaskQuadrant(assignmentModal.taskId, "DO", {
                    dueDate: tomorrow.toISOString(),
                  });
                  onClose();
                }}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left font-sans"
              >
                <span className="block text-xl font-black mb-1 text-slate-700 dark:text-slate-200">
                  Tomorrow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:opacity-50">
                  Medium Priority
                </span>
              </button>
            </div>
          )}

          {assignmentModal.quadrant === "SCHEDULE" && (
            <div className="flex flex-col gap-4">
              <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">
                Select a date to commit to this task.
              </p>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-emerald-500 dark:focus:border-emerald-600 font-bold text-slate-700 dark:text-slate-200 font-sans"
                onChange={(e) => {
                  if (e.target.value) {
                    updateTaskQuadrant(assignmentModal.taskId, "SCHEDULE", {
                      dueDate: new Date(e.target.value).toISOString(),
                    });
                    onClose();
                  }
                }}
              />
            </div>
          )}

          {(assignmentModal.quadrant === "ELIMINATE" ||
            assignmentModal.quadrant === "INBOX") && (
            <div className="grid grid-cols-1 gap-3 font-sans">
              <button
                onClick={() => {
                  updateTaskQuadrant(
                    assignmentModal.taskId,
                    assignmentModal.quadrant,
                    { delegateId: null },
                  );
                  onClose();
                }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:bg-indigo-600 transition-all">
                  <Target size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    Confirm Assignment
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Add to {assignmentModal.quadrant}
                  </span>
                </div>
              </button>
            </div>
          )}

          {assignmentModal.quadrant === "MOVE" && (
            <div className="grid grid-cols-1 gap-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
              <button
                onClick={() => {
                  const today = new Date();
                  updateTaskQuadrant(assignmentModal.taskId, "DO", {
                    dueDate: today.toISOString(),
                  });
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Flame size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-rose-700 dark:text-rose-400">
                    Do First (Urgent & Important)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Move to Do
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (setAssignmentModal) {
                    setAssignmentModal({
                      taskId: assignmentModal.taskId,
                      quadrant: "SCHEDULE",
                    });
                  } else {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    updateTaskQuadrant(assignmentModal.taskId, "SCHEDULE", {
                      dueDate: tomorrow.toISOString(),
                    });
                    onClose();
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Calendar size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Schedule (Not Urgent & Important)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Move to Schedule
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (setAssignmentModal) {
                    setAssignmentModal({
                      taskId: assignmentModal.taskId,
                      quadrant: "DELEGATE",
                    });
                  } else {
                    updateTaskQuadrant(assignmentModal.taskId, "DELEGATE", {});
                    onClose();
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Users size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    Delegate (Urgent & Not Important)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Move to Delegate
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  updateTaskQuadrant(assignmentModal.taskId, "ELIMINATE", {
                    isDeleted: true,
                  });
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Trash2 size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-rose-700 dark:text-rose-450">
                    Eliminate (Not Urgent & Not Important)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Delete Task
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  updateTaskQuadrant(assignmentModal.taskId, "INBOX", {
                    delegateId: null,
                    dueDate: null,
                  });
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center shrink-0">
                  <Inbox size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    Move to Inbox
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Remove Priority
                  </span>
                </div>
              </button>

              {workspaces && workspaces.length > 1 && currentTask && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Transfer to Workspace
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {workspaces
                      .filter((ws) => ws.id !== currentTask.workspaceId)
                      .map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => {
                            updateTaskQuadrant(assignmentModal.taskId, currentTask.quadrant, {
                              workspaceId: ws.id,
                            });
                            onClose();
                          }}
                          className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-50 dark:border-indigo-950/30 hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-all text-left font-sans"
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 text-xs font-black">
                            {ws.name[0].toUpperCase()}
                          </div>
                          <span className="font-black text-[11px] uppercase tracking-wide text-slate-700 dark:text-slate-200 truncate">
                            {ws.name}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
