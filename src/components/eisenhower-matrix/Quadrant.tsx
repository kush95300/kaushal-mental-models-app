"use client";

import React from "react";
import { Move, Info, Clock } from "lucide-react";
import { Task } from "@/types/eisenhower";
import { TaskCard } from "./TaskCard";
import { formatMinutes } from "@/lib/formatTime";

export interface QuadrantConfig {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  textColor: string;
  lightColor: string;
  icon: React.ReactNode;
  description: string;
}

interface QuadrantProps {
  qConfig: QuadrantConfig;
  tasks: Task[];
  activeQuadrant: string | null;
  visibleLimit: number;
  onDragOver: (e: React.DragEvent, quadrant: string) => void;
  onDrop: (e: React.DragEvent, quadrant: string) => void;
  setActiveQuadrant: (quadrant: string | null) => void;
  // Propagated to TaskCard
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

export const Quadrant: React.FC<QuadrantProps> = ({
  qConfig,
  tasks,
  activeQuadrant,
  visibleLimit,
  onDragOver,
  onDrop,
  setActiveQuadrant,
  onDragStart,
  toggleComplete,
  deleteTask,
  setEditingContentTaskId,
  setEditingContentValue,
  setEditingEstimatedMinutes,
  setEditingDateTaskId,
  setAssignmentModal,
}) => {
  const quadrantTasks = tasks.filter(
    (t) => t.quadrant === qConfig.id && !t.isDeleted && t.status !== "DONE",
  );
  const isActive = activeQuadrant === qConfig.id;

  const totalEstimatedTime = quadrantTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 0),
    0,
  );

  return (
    <div
      className={`relative flex flex-col h-full min-h-[300px] rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
        isActive
          ? "scale-[1.02] border-indigo-400 shadow-2xl z-10 bg-white"
          : qConfig.borderColor +
            " bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/50"
      }`}
      onDragOver={(e) => onDragOver(e, qConfig.id)}
      onDragLeave={() => setActiveQuadrant(null)}
      onDrop={(e) => onDrop(e, qConfig.id)}
    >
      <div
        className={`p-5 flex items-center justify-between border-b ${qConfig.borderColor} ${qConfig.lightColor} transition-colors duration-300`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl text-white shadow-lg ${qConfig.color} transition-transform duration-500 hover:rotate-6`}
          >
            {qConfig.icon}
          </div>
          <div>
            <h3
              className={`font-black text-sm uppercase tracking-wider ${qConfig.textColor}`}
            >
              {qConfig.title}
            </h3>
            <p className="text-[10px] font-bold opacity-60 italic tracking-wide">
              {qConfig.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full ${qConfig.color} bg-opacity-10 ${qConfig.textColor} animate-pulse`}
          >
            {quadrantTasks.length}
          </span>
          {totalEstimatedTime > 0 && (
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Clock size={10} /> {formatMinutes(totalEstimatedTime)}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex-grow p-4 overflow-y-auto custom-scrollbar scroll-smooth"
        style={{ maxHeight: `${visibleLimit * 54 + 16}px` }}
      >
        {quadrantTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
            <div
              className={`p-4 rounded-full border-2 border-dashed ${qConfig.borderColor} mb-3`}
            >
              <div className="flex items-center justify-center">
                <Move className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">
              Empty Space
            </p>
          </div>
        ) : (
          quadrantTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              setEditingContentTaskId={setEditingContentTaskId}
              setEditingContentValue={setEditingContentValue}
              setEditingEstimatedMinutes={setEditingEstimatedMinutes}
              setEditingDateTaskId={setEditingDateTaskId}
              setAssignmentModal={setAssignmentModal}
            />
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-white/40 border-t border-white/50">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> {qConfig.description}
        </p>
      </div>
    </div>
  );
};
