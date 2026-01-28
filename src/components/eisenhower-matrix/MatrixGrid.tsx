"use client";

import React, { useMemo } from "react";
import { PlusCircle, Wind } from "lucide-react";
import { Quadrant, QuadrantConfig } from "./Quadrant";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/eisenhower";

interface MatrixGridProps {
  loading: boolean;
  tasks: Task[];
  visibleLimit: number;
  activeQuadrant: string | null;
  onDragOver: (e: React.DragEvent, quadrant: string) => void;
  onDrop: (e: React.DragEvent, quadrant: string) => void;
  onDragStart: (taskId: number) => void;
  setActiveQuadrant: (quadrant: string | null) => void;
  toggleComplete: (taskId: number) => void;
  deleteTask: (taskId: number) => void;
  setEditingContentTaskId: (taskId: number | null) => void;
  setEditingContentValue: (content: string) => void;
  setEditingEstimatedMinutes: (minutes: string) => void;
  setEditingDateTaskId: (taskId: number | null) => void;
  setAssignmentModal: (
    data: { taskId: number; quadrant: string } | null,
  ) => void;
  QUAD_CONFIG: Record<string, QuadrantConfig>;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  loading,
  tasks,
  visibleLimit,
  activeQuadrant,
  onDragOver,
  onDrop,
  onDragStart,
  setActiveQuadrant,
  toggleComplete,
  deleteTask,
  setEditingContentTaskId,
  setEditingContentValue,
  setEditingEstimatedMinutes,
  setEditingDateTaskId,
  setAssignmentModal,
  QUAD_CONFIG,
}) => {
  const inboxTasks = useMemo(
    () => tasks.filter((t) => t.quadrant === "INBOX" && !t.isDeleted),
    [tasks],
  );

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 opacity-50 py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-xs uppercase tracking-widest text-indigo-600">
          Synchronizing Focus...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {/* Inbox / Queue */}
      <div className="flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-dashed border-slate-200 min-h-[400px]">
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Draft Queue
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-800">Inbox</span>
              <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                {inboxTasks.length}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-400 rounded-2xl">
            <PlusCircle className="w-5 h-5" />
          </div>
        </div>

        <div
          className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2"
          style={{ maxHeight: `${visibleLimit * 64}px` }}
        >
          {inboxTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-20">
              <Wind className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Inbox is clear.
                <br />
                Ready for input.
              </p>
            </div>
          ) : (
            inboxTasks.map((task) => (
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
      </div>

      {/* Matrix Core */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(QUAD_CONFIG).map((q) => (
          <Quadrant
            key={q.id}
            qConfig={q}
            tasks={tasks}
            activeQuadrant={activeQuadrant}
            visibleLimit={visibleLimit}
            onDragOver={onDragOver}
            onDrop={onDrop}
            setActiveQuadrant={setActiveQuadrant}
            onDragStart={onDragStart}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            setEditingContentTaskId={setEditingContentTaskId}
            setEditingContentValue={setEditingContentValue}
            setEditingEstimatedMinutes={setEditingEstimatedMinutes}
            setEditingDateTaskId={setEditingDateTaskId}
            setAssignmentModal={setAssignmentModal}
          />
        ))}
      </div>
    </div>
  );
};
