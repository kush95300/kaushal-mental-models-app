"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  Linkedin,
  Github,
  ExternalLink,
  Wind,
  Lightbulb,
} from "lucide-react";
import { MatrixHeader } from "@/components/eisenhower-matrix/MatrixHeader";
import { StatsView } from "@/components/eisenhower-matrix/StatsView";
import { MainTaskForm } from "@/components/eisenhower-matrix/MainTaskForm";
import { MatrixGrid } from "@/components/eisenhower-matrix/MatrixGrid";

const QUADRANTS = {
  DO: {
    id: "DO",
    title: "Urgent & Important",
    subtitle: "Do First",
    color: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    lightColor: "bg-rose-50/80",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    icon: <Flame className="w-5 h-5" />,
    description: "Critical tasks that need immediate action.",
  },
  SCHEDULE: {
    id: "SCHEDULE",
    title: "Not Urgent & Important",
    subtitle: "Schedule",
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    lightColor: "bg-indigo-50/80",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
    icon: <Calendar className="w-5 h-5" />,
    description: "Long-term goals and planning.",
  },
  DELEGATE: {
    id: "DELEGATE",
    title: "Urgent & Not Important",
    subtitle: "Delegate",
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
    lightColor: "bg-amber-50/80",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    icon: <Users className="w-5 h-5" />,
    description: "Tasks that can be done by someone else.",
  },
  ELIMINATE: {
    id: "ELIMINATE",
    title: "Not Urgent & Not Important",
    subtitle: "Eliminate",
    color: "bg-slate-500",
    hoverColor: "hover:bg-slate-600",
    lightColor: "bg-slate-50/80",
    borderColor: "border-slate-200",
    textColor: "text-slate-700",
    icon: <Wind className="w-5 h-5" />,
    description: "Entertainment or low-priority tasks to do after others.",
  },
};

export default function EisenhowerMatrixPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-black text-indigo-600 animate-pulse">
          Loading Focus Matrix...
        </div>
      }
    >
      <EisenhowerMatrixContent />
    </Suspense>
  );
}

function EisenhowerMatrixContent() {
  const [newTask, setNewTask] = useState("");
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState<string>("");
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(5);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState<{
    taskId: number;
    quadrant: string;
  } | null>(null);
  const [editingDateTaskId, setEditingDateTaskId] = useState<number | null>(
    null,
  );
  const [editingContentTaskId, setEditingContentTaskId] = useState<
    number | null
  >(null);
  const [editingContentValue, setEditingContentValue] = useState("");
  const [editingEstimatedMinutes, setEditingEstimatedMinutes] =
    useState<string>("");
  const [showDoneList, setShowDoneList] = useState(false);
  const [showDeletedList, setShowDeletedList] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

  const [newDelegateName, setNewDelegateName] = useState("");
  const [, setConfig] = useState<{
    analyticsStartDate: string | null;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [currentDateDisplay, setCurrentDateDisplay] = useState("");
  const [modalWarning, setModalWarning] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    tasks,
    delegates,
    loading,
    fetchTasks,
    addTask,
    updateTaskStatus,
    updateTaskQuadrant,
    updateTaskContent,
    deleteTask,
    hardDeleteTask,
    revertDeletion,
    addDelegateOp,
    removeDelegateOp,
    resetDataOp,
  } = useTaskOperations({ isTestMode });

  // Helper functions defined before effects to avoid usage before declaration
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (
          !data.analyticsStartDate &&
          searchParams.get("showHelp") !== "true"
        ) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Fetch config error:", error);
    }
  }, [searchParams]);

  const setAnalyticsStart = async (startDate: string | null) => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyticsStartDate: startDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error("Update config error:", error);
    }
  };

  useEffect(() => {
    // fetchDelegates handled by hook
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConfig();
    setCurrentDateDisplay(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, [fetchConfig]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval === 0) return;
    const interval = setInterval(() => {
      fetchTasks();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchTasks]);

  useEffect(() => {
    if (searchParams.get("showHelp") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowHelpModal(true);
    }
  }, [searchParams]);

  const handleCloseHelp = () => {
    if (searchParams.get("showHelp") === "true") {
      router.push("/");
    } else {
      setShowHelpModal(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    // Resolve self delegate if needed or pass logic to hook?
    // Hook expects delegateId.
    // Logic in hook for test mode uses "Self", logic in API uses "Self".
    // We should pass the ID.
    const selfDelegate = delegates.find((d) => d.name.toLowerCase() === "self");
    await addTask(
      newTask,
      parseInt(newEstimatedMinutes) || null,
      selfDelegate?.id || null,
    );

    setNewTask("");
    setNewEstimatedMinutes("");
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status !== "DONE" && task.quadrant === "INBOX") {
      // Simple alert replacement or modal
      alert("First assign it or move to matrix then do it.");
      return;
    }

    if (task.status === "TODO") {
      setCompletingTaskId(id);
      setShowCompletionModal(true);
    } else {
      // Reopening task
      updateTaskStatus(id, "TODO", null);
    }
  };

  const handleCompletionConfirm = (actualMinutes: number) => {
    if (completingTaskId === null) return;
    updateTaskStatus(completingTaskId, "DONE", actualMinutes);
    setShowCompletionModal(false);
    setCompletingTaskId(null);
  };

  const onDragStart = (id: number) => {
    setDraggedTaskId(id);
  };

  const onDragOver = (e: React.DragEvent, quadrantId: string) => {
    e.preventDefault();
    setActiveQuadrant(quadrantId);
  };

  const onDrop = async (e: React.DragEvent, quadrantId: string) => {
    e.preventDefault();
    if (draggedTaskId === null) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (
      task?.quadrant === "INBOX" &&
      quadrantId !== "INBOX" &&
      !task.estimatedMinutes
    ) {
      setEditingContentTaskId(task.id);
      setEditingContentValue(task.content);
      setEditingEstimatedMinutes("");
      setModalWarning(
        "Please set a time estimate before moving this task to the matrix.",
      );

      setDraggedTaskId(null);
      setActiveQuadrant(null);
      return;
    }

    if (
      quadrantId === "DO" ||
      quadrantId === "SCHEDULE" ||
      quadrantId === "DELEGATE"
    ) {
      setAssignmentModal({ taskId: draggedTaskId, quadrant: quadrantId });
    } else {
      updateTaskQuadrant(draggedTaskId, quadrantId);
    }

    setDraggedTaskId(null);
    setActiveQuadrant(null);
  };

  const saveTaskContent = async () => {
    if (!editingContentTaskId) return;

    const contentToSave = editingContentValue.trim();
    const minutesToSave = parseInt(editingEstimatedMinutes) || null;

    if (!contentToSave) return;

    await updateTaskContent(editingContentTaskId, contentToSave, minutesToSave);
    setEditingContentTaskId(null);
    setEditingContentValue("");
    setEditingEstimatedMinutes("");
  };

  const addDelegate = async () => {
    if (!newDelegateName.trim()) return;
    await addDelegateOp(newDelegateName);
    setNewDelegateName("");
  };

  const removeDelegate = async (id: number) => {
    await removeDelegateOp(id);
  };

  const resetData = async (type: "today" | "all") => {
    if (
      !confirm(
        `Are you sure you want to reset ${
          type === "today" ? "today's" : "all"
        } data?`,
      )
    )
      return;

    await resetDataOp(type);
  };

  const stats = {
    total: tasks.filter((t) => !t.isDeleted).length,
    completed: tasks.filter((t) => t.status === "DONE" && !t.isDeleted).length,
    pending: tasks.filter((t) => t.status === "TODO" && !t.isDeleted).length,
    eliminated: tasks.filter((t) => t.isDeleted).length,
    delegated: tasks.filter(
      (t) =>
        !t.isDeleted && t.delegate && t.delegate.name.toLowerCase() !== "self",
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden text-slate-900 font-sans p-4 md:p-8 flex flex-col">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] opacity-[0.05] text-amber-500 animate-pulse-slow">
          <Lightbulb size={600} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] text-indigo-500">
          <Lightbulb size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[120px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/30 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(#4f46e5 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        <MatrixHeader
          isTestMode={isTestMode}
          tasks={tasks}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          visibleLimit={visibleLimit}
          setVisibleLimit={setVisibleLimit}
          setShowDoneList={setShowDoneList}
          setShowDeletedList={setShowDeletedList}
          setShowHelpModal={setShowHelpModal}
          setShowDelegateModal={setShowDelegateModal}
          fetchTasks={fetchTasks}
          resetData={resetData}
        />

        <StatsView currentDateDisplay={currentDateDisplay} stats={stats} />
      </div>

      <MainTaskForm
        newTask={newTask}
        setNewTask={setNewTask}
        newEstimatedMinutes={newEstimatedMinutes}
        setNewEstimatedMinutes={setNewEstimatedMinutes}
        handleAddTask={handleAddTask}
      />

      <MatrixGrid
        loading={loading}
        tasks={tasks}
        visibleLimit={visibleLimit}
        activeQuadrant={activeQuadrant}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragStart={onDragStart}
        setActiveQuadrant={setActiveQuadrant}
        toggleComplete={toggleComplete}
        deleteTask={deleteTask}
        setEditingContentTaskId={setEditingContentTaskId}
        setEditingContentValue={setEditingContentValue}
        setEditingEstimatedMinutes={setEditingEstimatedMinutes}
        setEditingDateTaskId={setEditingDateTaskId}
        setAssignmentModal={setAssignmentModal}
        QUAD_CONFIG={QUADRANTS}
      />

      <footer className="mt-16 py-8 text-center relative z-10 group">
        <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
          Turning mental models into action
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200" />
          <p className="text-lg font-bold text-slate-500 tracking-tight">
            Created with{" "}
            <span className="text-rose-500 animate-pulse inline-block mx-0.5">
              ❤️
            </span>{" "}
            by{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const links = [
                  "https://www.linkedin.com/in/sonikaushal/",
                  "https://github.com/kush95300/",
                  "https://flowcv.me/kaushal-soni",
                ];
                const randomLink =
                  links[Math.floor(Math.random() * links.length)];
                window.open(randomLink, "_blank", "noopener,noreferrer");
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold hover:opacity-80 transition-opacity cursor-pointer inline-block"
            >
              Kaushal Soni
            </a>
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <a
            href="https://www.linkedin.com/in/sonikaushal/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all"
            title="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://github.com/kush95300/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all"
            title="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://flowcv.me/kaushal-soni"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all"
            title="FlowCV Portfolio"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </footer>

      {/* Modals */}
      {showHelpModal && <HelpModal onClose={handleCloseHelp} />}
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onConfirm={handleCompletionConfirm}
          taskContent={
            tasks.find((t) => t.id === completingTaskId)?.content || ""
          }
          estimatedMinutes={
            tasks.find((t) => t.id === completingTaskId)?.estimatedMinutes ||
            null
          }
        />
      )}
      {assignmentModal && (
        <AssignmentModal
          assignmentModal={assignmentModal}
          tasks={tasks}
          delegates={delegates}
          onClose={() => setAssignmentModal(null)}
          updateTaskQuadrant={updateTaskQuadrant}
          setShowDelegateModal={setShowDelegateModal}
          setShowOnboarding={setShowOnboarding}
        />
      )}
      {showDelegateModal && (
        <DelegateModal
          delegates={delegates}
          newDelegateName={newDelegateName}
          setNewDelegateName={setNewDelegateName}
          addDelegate={addDelegate}
          removeDelegate={removeDelegate}
          onClose={() => setShowDelegateModal(false)}
        />
      )}
      {showOnboarding && (
        <OnboardingModal
          setAnalyticsStart={setAnalyticsStart}
          setIsTestMode={setIsTestMode}
          setShowOnboarding={setShowOnboarding}
        />
      )}
      {showDoneList && (
        <DoneListModal
          tasks={tasks}
          onClose={() => setShowDoneList(false)}
          toggleComplete={toggleComplete}
        />
      )}
      {showDeletedList && (
        <DeletedListModal
          tasks={tasks}
          onClose={() => setShowDeletedList(false)}
          revertDeletion={revertDeletion}
          hardDeleteTask={hardDeleteTask}
        />
      )}
      {editingDateTaskId && (
        <DatePickerModal
          editingDateTaskId={editingDateTaskId}
          tasks={tasks}
          onClose={() => setEditingDateTaskId(null)}
          updateTaskQuadrant={updateTaskQuadrant}
        />
      )}
      {editingContentTaskId && (
        <EditContentModal
          editingContentTaskId={editingContentTaskId}
          editingContentValue={editingContentValue}
          setEditingContentValue={setEditingContentValue}
          editingEstimatedMinutes={editingEstimatedMinutes}
          setEditingEstimatedMinutes={setEditingEstimatedMinutes}
          warningMessage={modalWarning}
          onClose={() => {
            setEditingContentTaskId(null);
            setEditingContentValue("");
            setEditingEstimatedMinutes("");
            setModalWarning(null);
          }}
          saveTaskContent={saveTaskContent}
        />
      )}

      {/* Estimated Minutes Input in Edit Modal - Since I can't easily edit the EditContentModal again without another write, I'll add a temporary overlay or just update it now */}
    </div>
  );
}

// Re-writing the EditContentModal inline or adding the duration input to the existing one.
// Actually, I'll just write a better EditContentModal in the first place or update it now.
