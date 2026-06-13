"use client";

import React from "react";
import { PlusCircle, Wind } from "lucide-react";
import { Quadrant, QuadrantConfig } from "./Quadrant";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/eisenhower";
import { Tooltip } from "../ui/Tooltip";

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
  setEditingReminderMinutes: (minutes: string) => void;
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
  setEditingReminderMinutes,
  setEditingDateTaskId,
  setAssignmentModal,
  QUAD_CONFIG,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("INBOX");
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const inboxTasks = tasks.filter(
    (t) => t.quadrant === "INBOX" && !t.isDeleted,
  );

  const tabs = [
    {
      id: "INBOX",
      label: "Inbox",
      color: "bg-slate-500",
      textColor: "text-slate-600 dark:text-slate-400",
    },
    {
      id: "DO",
      label: "Do First",
      color: "bg-rose-500",
      textColor: "text-rose-600 dark:text-rose-400",
    },
    {
      id: "SCHEDULE",
      label: "Schedule",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "DELEGATE",
      label: "Delegate",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "ELIMINATE",
      label: "Eliminate",
      color: "bg-slate-400",
      textColor: "text-slate-500 dark:text-slate-400",
    },
  ];

  const renderInbox = () => (
    <div
      id="matrix-inbox-container"
      className="flex flex-col h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2.5rem] p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[400px]"
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Draft Queue
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
              Inbox
            </span>
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
              {inboxTasks.length}
            </span>
          </div>
        </div>
        <Tooltip
          content="Draft Queue Inbox: Tasks created without a specific quadrant appear here. Drag them into the matrix to prioritize."
          position="top"
          align="right"
        >
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl relative z-10 hover:z-[9999]">
            <PlusCircle className="w-5 h-5" />
          </div>
        </Tooltip>
      </div>

      <div
        className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2"
        style={{ maxHeight: isMobile ? "60vh" : `${visibleLimit * 64}px` }}
      >
        {inboxTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-20 dark:opacity-40">
            <Wind className="w-12 h-12 mb-4 text-slate-900 dark:text-white" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
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
              setEditingReminderMinutes={setEditingReminderMinutes}
              setEditingDateTaskId={setEditingDateTaskId}
              setAssignmentModal={setAssignmentModal}
            />
          ))
        )}
      </div>
    </div>
  );

  const activeQuadConfig = Object.values(QUAD_CONFIG).find(
    (q) => q.id === activeTab,
  );

  return (
    <div className="flex-grow flex flex-col w-full">
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar gap-1 mb-6 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onDragEnter={() => setActiveTab(tab.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, tab.id)}
              className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 text-center ${
                isActive
                  ? `${tab.color} text-white shadow-md`
                  : `text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Task Prioritize Helper Tip */}
      {isMobile && tasks.filter((t) => !t.isDeleted).length > 0 && (
        <div className="mx-2 mb-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500">🎯</span>
          <span>Tip: Tap the 🎯 target icon on any task card to move it between quadrants.</span>
        </div>
      )}

      {/* Desktop view (hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {/* Inbox / Queue */}
        {renderInbox()}

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
              setEditingReminderMinutes={setEditingReminderMinutes}
              setEditingDateTaskId={setEditingDateTaskId}
              setAssignmentModal={setAssignmentModal}
            />
          ))}
        </div>
      </div>

      {/* Mobile view (hidden on desktop) */}
      <div className="block md:hidden pb-20 w-full">
        {activeTab === "INBOX"
          ? renderInbox()
          : activeQuadConfig && (
              <Quadrant
                key={activeQuadConfig.id}
                qConfig={activeQuadConfig}
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
                setEditingReminderMinutes={setEditingReminderMinutes}
                setEditingDateTaskId={setEditingDateTaskId}
                setAssignmentModal={setAssignmentModal}
              />
            )}
      </div>
    </div>
  );
};
