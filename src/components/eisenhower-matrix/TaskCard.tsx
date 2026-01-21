"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Users,
  Pencil,
  UserCog,
  Trash2,
  Clock,
} from "lucide-react";
import { Task } from "@/types/eisenhower";
import { formatMinutes } from "@/lib/formatTime";
import { formatFriendlyDate, isOverdue } from "@/lib/dateUtils";

interface TaskCardProps {
  task: Task;
  onDragStart: (taskId: number) => void;
  toggleComplete: (taskId: number) => void;
  deleteTask: (taskId: number) => void;
  setEditingContentTaskId: (taskId: number | null) => void;
  setEditingContentValue: (content: string) => void;
  setEditingEstimatedMinutes: (minutes: string) => void;
  setEditingDateTaskId: (taskId: number | null) => void;
  setAssignmentModal: (
    data: { taskId: number; quadrant: string } | null,
  ) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  toggleComplete,
  deleteTask,
  setEditingContentTaskId,
  setEditingContentValue,
  setEditingEstimatedMinutes,
  setEditingDateTaskId,
  setAssignmentModal,
}) => (
  <div
    draggable
    onDragStart={() => onDragStart(task.id)}
    className={`group relative flex items-center gap-3 p-3 mb-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-600 hover:scale-[1.01] active:scale-[0.98] hover:z-50
        ${task.status === "DONE" ? "opacity-60" : ""}
        ${
          isOverdue(task.dueDate || "") && task.status !== "DONE"
            ? "!border-rose-300 !bg-rose-50/50 dark:!bg-rose-900/20 dark:!border-rose-800"
            : ""
        }
        `}
  >
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleComplete(task.id);
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex-shrink-0 relative z-20 transition-transform duration-200 hover:scale-125 rounded-full"
    >
      {task.status === "DONE" ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
      ) : (
        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
      )}
    </button>

    <div className="flex-grow min-w-0 relative group/text">
      <span
        className={`block text-sm font-medium truncate transition-all duration-300 ${
          task.status === "DONE"
            ? "line-through text-slate-400 dark:text-slate-600"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {task.content}
      </span>

      {/* Tooltip for long text */}
      <div className="absolute left-0 top-full mt-3 hidden group-hover/text:block z-[200] w-72 p-4 bg-indigo-950 text-white text-xs font-bold rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border border-indigo-500/30 ring-4 ring-indigo-500/10">
        <div className="relative z-10 leading-relaxed">{task.content}</div>
        <div className="absolute left-4 -top-1.5 w-3 h-3 bg-indigo-950 rotate-45 border-l border-t border-indigo-500/30" />
      </div>
      {task.dueDate && (
        <span
          className={`text-[10px] font-bold uppercase flex items-center gap-1 mt-0.5 ${
            isOverdue(task.dueDate) && task.status !== "DONE"
              ? "text-rose-500 dark:text-rose-400"
              : "text-indigo-400 dark:text-indigo-300"
          }`}
        >
          <Calendar className="w-3 h-3" />
          {isOverdue(task.dueDate) && task.status !== "DONE" ? (
            <span>Overdue: {formatFriendlyDate(task.dueDate)}</span>
          ) : (
            <span>Due {formatFriendlyDate(task.dueDate)}</span>
          )}
          {isOverdue(task.dueDate) && task.status !== "DONE" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingDateTaskId(task.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="ml-2 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800 text-rose-600 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-700 shadow-sm transition-colors"
            >
              Reschedule
            </button>
          )}
        </span>
      )}
      {task.estimatedMinutes && (
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 mt-0.5">
          <Clock size={12} className="text-indigo-400 dark:text-indigo-300" />{" "}
          {formatMinutes(task.estimatedMinutes)}
        </span>
      )}
      {task.delegate && task.quadrant !== "INBOX" && (
        <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1 mt-0.5">
          <Users className="w-3 h-3" /> {task.delegate.name}
        </span>
      )}
    </div>

    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingContentTaskId(task.id);
          setEditingContentValue(task.content);
          setEditingEstimatedMinutes(task.estimatedMinutes?.toString() || "");
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="p-1.5 relative z-20 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
        title="Edit Content"
      >
        <Pencil className="w-4 h-4" />
      </button>
      {task.quadrant !== "INBOX" && task.quadrant !== "DO" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingDateTaskId(task.id);
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 relative z-20 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
          title="Change Due Date"
        >
          <Calendar className="w-4 h-4" />
        </button>
      )}
      {task.quadrant === "DELEGATE" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAssignmentModal({ taskId: task.id, quadrant: "DELEGATE" });
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 relative z-20 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
          title="Reassign Delegate"
        >
          <UserCog className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="p-1.5 relative z-20 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
        title="Delete Task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);
