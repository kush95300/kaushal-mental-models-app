"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Wind,
  Lightbulb,
  Flame,
  Calendar,
  Users,
  Linkedin,
  Github,
  ExternalLink,
  RotateCcw,
  PlusCircle,
  UserCog,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { MatrixHeader } from "@/components/eisenhower-matrix/MatrixHeader";
import { StatsView } from "@/components/eisenhower-matrix/StatsView";
import { MainTaskForm } from "@/components/eisenhower-matrix/MainTaskForm";
import { MatrixGrid } from "@/components/eisenhower-matrix/MatrixGrid";
import { CalendarView } from "@/components/eisenhower-matrix/CalendarView";
import { WorkspaceSelectionModal } from "@/components/eisenhower-matrix/WorkspaceSelectionModal";
import { PageTutorial, TutorialStep } from "@/components/tour/PageTutorial";
import { VideoTourPlayer } from "@/components/tour/VideoTourPlayer";

import { useTaskOperations } from "@/hooks/useTaskOperations";
import { HelpModal } from "@/components/eisenhower-matrix/modals/HelpModal";
import { AssignmentModal } from "@/components/eisenhower-matrix/modals/AssignmentModal";
import { DelegateModal } from "@/components/eisenhower-matrix/modals/DelegateModal";
import { OnboardingModal } from "@/components/eisenhower-matrix/modals/OnboardingModal";
import { DoneListModal } from "@/components/eisenhower-matrix/modals/DoneListModal";
import { DeletedListModal } from "@/components/eisenhower-matrix/modals/DeletedListModal";
import { DatePickerModal } from "@/components/eisenhower-matrix/modals/DatePickerModal";
import { EditContentModal } from "@/components/eisenhower-matrix/modals/EditContentModal";
import { CompletionModal } from "@/components/eisenhower-matrix/modals/CompletionModal";
import { SettingsModal } from "@/components/eisenhower-matrix/modals/SettingsModal";
import { ResetConfirmModal } from "@/components/eisenhower-matrix/modals/ResetConfirmModal";
import { NotificationManager } from "@/components/NotificationManager";
import { Task, Delegate } from "@/types/eisenhower";

import { getCurrentUser } from "@/actions/auth";
import { User } from "@/types/eisenhower";

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
  const searchParams = useSearchParams();
  const testModeParam = searchParams.get("testMode");
  const isTestModeParam = testModeParam === "true";
  const workspaceIdVal = searchParams.get("workspaceId");
  const paramWorkspaceId =
    workspaceIdVal && !isNaN(parseInt(workspaceIdVal))
      ? parseInt(workspaceIdVal)
      : null;
  const [newTask, setNewTask] = useState("");
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState<string>("");
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(5);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceModalView, setWorkspaceModalView] = useState<
    "initial" | "list" | "create" | "edit"
  >("initial");
  const [selectionMade, setSelectionMade] = useState(
    !!paramWorkspaceId || isTestModeParam,
  );
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
  const [editingReminderMinutes, setEditingReminderMinutes] =
    useState<string>("");
  const [showDoneList, setShowDoneList] = useState(false);
  const [showDeletedList, setShowDeletedList] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<"today" | "all" | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"matrix" | "calendar">("matrix");

  const [newDelegateName, setNewDelegateName] = useState("");
  const [, setConfig] = useState<{
    analyticsStartDate: string | null;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [currentDateDisplay, setCurrentDateDisplay] = useState("");
  const [modalWarning, setModalWarning] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPageTutorial, setShowPageTutorial] = useState(false);
  const [showVideoTour, setShowVideoTour] = useState(false);
  const [isManualTour, setIsManualTour] = useState(false);
  const [selectedTutorialType, setSelectedTutorialType] = useState<"main" | "addTask" | "addDelegate" | "analytics">("main");
  const [showTutorialCompletionModal, setShowTutorialCompletionModal] = useState(false);
  const router = useRouter();

  // Load current user and state
  useEffect(() => {
    const loadUser = async () => {
      const res = await getCurrentUser();
      const activeUser = res.success && res.user ? (res.user as User) : null;
      const username = activeUser?.username || "guest";
      
      setUser(activeUser);

      const forceVideoTour = searchParams.get("videoTour") === "true";
      const forceTutorial = searchParams.get("tutorial") === "true";
      if (forceVideoTour) {
        localStorage.removeItem(`tour_dismissed_${username}`);
        setIsManualTour(true);
        setShowVideoTour(true);
      } else if (forceTutorial) {
        localStorage.removeItem(`tutorial_dismissed_eisenhower_${username}`);
        setShowPageTutorial(true);
      } else {
        const tourDismissed = localStorage.getItem(`tour_dismissed_${username}`);
        if (!tourDismissed) {
          setShowVideoTour(true);
        } else {
          const dismissedPage = localStorage.getItem(`tutorial_dismissed_eisenhower_${username}`);
          if (!dismissedPage) {
            setShowPageTutorial(true);
          }
        }
      }
    };
    loadUser();
  }, [searchParams]);

  // Show workspace modal on mount if no selection has been made yet
  useEffect(() => {
    const hasSelection =
      searchParams.has("workspaceId") || searchParams.has("testMode");
    const isHelp = searchParams.get("showHelp") === "true";

    if (!hasSelection && !isHelp) {
      setShowWorkspaceModal(true);
    } else {
      setShowWorkspaceModal(false);
      if (hasSelection) {
        setSelectionMade(true);
      }
    }
  }, [searchParams]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // 'n' for New Task
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        const input = document.querySelector(
          'input[placeholder*="What objective"]',
        ) as HTMLInputElement;
        input?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    workspaces,
    activeWorkspaceId,
    isTestMode,
    selectWorkspaceOp,
    addWorkspaceOp,
    updateWorkspaceOp,
    deleteWorkspaceOp,
    maxDailyMinutes,
    updateMaxMinutesOp,
    dailyWorkload,
    isOverburdened,
  } = useTaskOperations({
    isTestMode: isTestModeParam,
    initialWorkspaceId: paramWorkspaceId,
  });

  const MAIN_STEPS: TutorialStep[] = [
    {
      selector: "#matrix-header",
      title: "Header Workspace & Settings",
      description: "Here you can switch workspaces, adjust refresh intervals, toggle light/dark theme, and manage settings.",
      position: "bottom"
    },
    {
      selector: "#matrix-stats-view",
      title: "Focus Statistics & Workload",
      description: "Track your workload balance, daily active limits, and core matrix metrics to gauge your output.",
      position: "bottom"
    },
    {
      selector: "#matrix-task-form",
      title: "Quick-Add Task Queue",
      description: "To add a task, type your objective and time estimate here. Pressing enter or clicking Add Task places it in the inbox (Draft Queue) instantly.",
      position: "bottom"
    },
    {
      selector: "#matrix-grid-container",
      title: "Eisenhower Grid Quadrants",
      description: "Drag and drop tasks here to prioritize. Double click or click to edit a task's due dates, quadrant, or team delegates.",
      position: "top"
    },
    {
      selector: "#btn-manage-delegates",
      title: "Manage Team Delegates",
      description: "Need to hand off a task? Click Manage Delegates to define team members, then assign tasks to them in the Delegate quadrant.",
      position: "bottom"
    },
    {
      selector: "#btn-archives",
      title: "Recover Completed & Eliminated Tasks",
      description: "Mistakes happen or tasks get finished! Click Done to view your history, or Eliminated to recover deleted/archived tasks.",
      position: "bottom"
    },
    ...(!isTestMode ? [{
      selector: "#btn-analytics",
      title: "Analytics & Performance Insights",
      description: "Ready to inspect your workload trends? Click the Analytics button to view detailed productivity distributions and delegation charts.",
      position: "bottom" as const
    }] : [])
  ];

  const ADD_TASK_STEPS: TutorialStep[] = [
    {
      selector: "#matrix-task-form",
      title: "1. Capture Objective & Time Estimate",
      description: "Start by drafting your task here. Enter a clear, action-oriented title (such as 'Sample Task: Learn Eisenhower Matrix') and specify an estimated duration in minutes. Setting time estimates is key to managing your daily workload capacity! When ready, click 'Add Task' or press Enter.",
      position: "bottom" as const
    },
    {
      selector: "#matrix-inbox-container",
      title: "2. Track in Draft Queue Inbox",
      description: "Once submitted, the task immediately lands in this Draft Queue (Inbox). This acts as a temporary holding zone, capturing all incoming noise before you prioritize, keeping your main workspace organized.",
      position: "right" as const
    },
    {
      selector: "#matrix-grid-container",
      title: "3. Prioritize via Quadrant Drag-and-Drop",
      description: "Now, click and drag the task out of the Inbox and drop it into the appropriate matrix quadrant based on its urgency and importance. This completes the priority setup!",
      position: "top" as const
    }
  ];

  const ADD_DELEGATE_STEPS: TutorialStep[] = [
    {
      selector: "#btn-manage-delegates",
      title: "1. Access the Team Delegation Center",
      description: "To delegate or share workload, click the 'Manage Delegates' button in the header. This opens the control panel where you can register teammates, collaborators, or project assignees.",
      position: "bottom" as const
    },
    {
      selector: "#input-delegate-name",
      title: "2. Focus Teammate Registration Field",
      description: "Inside the open dialog box, click on the teammate name input field to prepare the registration of a new assignee.",
      position: "bottom" as const
    },
    {
      selector: "#btn-add-delegate",
      title: "3. Register & Save Teammate",
      description: "Type your teammate's name (for example, 'Alex (Product Designer)') and click the 'Add Team Member' button to save them to your active workspace directory.",
      position: "bottom" as const
    },
    {
      selector: "#matrix-grid-container",
      title: "4. Hand Off & Assign Tasks",
      description: "Your teammate is now registered! You can assign tasks to them by placing tasks in the 'Delegate' quadrant or double-clicking any task in the grid and selecting their name from the assignees list.",
      position: "top" as const
    }
  ];

  const ANALYTICS_STEPS: TutorialStep[] = [
    {
      selector: "#btn-analytics",
      title: "Open Analytics Dashboard",
      description: "Click the Analytics icon in the header to view your productivity metrics, workload balance, and completion trends.",
      position: "bottom" as const
    }
  ];

  const activeTutorialSteps = (() => {
    switch (selectedTutorialType) {
      case "addTask":
        return ADD_TASK_STEPS;
      case "addDelegate":
        return ADD_DELEGATE_STEPS;
      case "analytics":
        return ANALYTICS_STEPS;
      case "main":
      default:
        return MAIN_STEPS;
    }
  })();

  // Synchronize activeWorkspaceId and isTestMode with the URL query parameters
  useEffect(() => {
    if (activeWorkspaceId !== null && selectionMade) {
      const isTest = isTestMode || !user;
      const targetUrl = `/eisenhower-matrix?workspaceId=${activeWorkspaceId}${isTest ? "&testMode=true" : ""}`;

      const currentWorkspaceParam = searchParams.get("workspaceId");
      const currentTestModeParam = searchParams.get("testMode");
      const expectedTestMode = isTest ? "true" : null;

      if (
        currentWorkspaceParam !== String(activeWorkspaceId) ||
        currentTestModeParam !== expectedTestMode
      ) {
        router.replace(targetUrl);
        setShowWorkspaceModal(false);
      }
    }
  }, [
    activeWorkspaceId,
    isTestMode,
    user,
    router,
    searchParams,
    selectionMade,
  ]);

  const handleSwitchWorkspace = () => {
    setWorkspaceModalView("initial");
    setShowWorkspaceModal(true);
  };

  const handleManageWorkspaces = () => {
    setWorkspaceModalView("list");
    setShowWorkspaceModal(true);
  };

  const handleWorkspaceSelect = async (id: number | null) => {
    await selectWorkspaceOp(id);
    setSelectionMade(true);
    setShowWorkspaceModal(false);
  };

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
      setShowHelpModal(true);
      setShowWorkspaceModal(false);
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
    const selfDelegate = delegates.find(
      (d: Delegate) => d.name.toLowerCase() === "self",
    );
    await addTask(
      newTask,
      parseInt(newEstimatedMinutes) || null,
      selfDelegate?.id || null,
    );

    setNewTask("");
    setNewEstimatedMinutes("");
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.find((t: Task) => t.id === id);
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

    const task = tasks.find((t: Task) => t.id === draggedTaskId);
    if (
      task?.quadrant === "INBOX" &&
      quadrantId !== "INBOX" &&
      !task.estimatedMinutes
    ) {
      setEditingContentTaskId(task.id);
      setEditingContentValue(task.content);
      setEditingEstimatedMinutes("");
      setEditingReminderMinutes(task.reminderMinutesBefore?.toString() || "");
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
    const reminderToSave = parseInt(editingReminderMinutes) || null;

    if (!contentToSave) return;

    await updateTaskContent(
      editingContentTaskId,
      contentToSave,
      minutesToSave,
      reminderToSave,
    );
    setEditingContentTaskId(null);
    setEditingContentValue("");
    setEditingEstimatedMinutes("");
    setEditingReminderMinutes("");
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
    setShowResetModal(type);
  };

  const handleConfirmReset = async () => {
    if (!showResetModal) return;
    await resetDataOp(showResetModal);
    setShowResetModal(null);
  };

  const stats = {
    total: tasks.filter((t: Task) => !t.isDeleted).length,
    completed: tasks.filter((t: Task) => t.status === "DONE" && !t.isDeleted)
      .length,
    pending: tasks.filter((t: Task) => t.status === "TODO" && !t.isDeleted)
      .length,
    eliminated: tasks.filter((t: Task) => t.isDeleted).length,
    delegated: tasks.filter(
      (t: Task) =>
        !t.isDeleted && t.delegate && t.delegate.name.toLowerCase() !== "self",
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 relative overflow-x-hidden text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8 flex flex-col transition-colors">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] opacity-[0.05] dark:opacity-[0.03] text-amber-500 animate-pulse-slow">
          <Lightbulb size={600} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] dark:opacity-[0.02] text-indigo-500">
          <Lightbulb size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[80px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/20 dark:bg-amber-900/10 rounded-full blur-[80px] animate-blob-slow animation-delay-2000" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]"
          style={{
            backgroundImage:
              "radial-gradient(#4f46e5 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        <NotificationManager
          tasks={tasks}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          updateTaskStatus={updateTaskStatus}
        />
        <div id="matrix-header">
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
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId || 0}
            updateWorkspaceOp={(id) => selectWorkspaceOp(id)}
            addWorkspaceOp={addWorkspaceOp}
            onSettingsClick={() => setShowSettingsModal(true)}
            isOverburdened={isOverburdened}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onManageWorkspaces={handleManageWorkspaces}
            user={user}
            onWatchTourClick={() => {
              setIsManualTour(true);
              setShowVideoTour(true);
            }}
          />
        </div>

        <div id="matrix-stats-view">
          <StatsView
            currentDateDisplay={currentDateDisplay}
            stats={stats}
            dailyWorkload={dailyWorkload}
            maxDailyMinutes={maxDailyMinutes}
            isOverburdened={isOverburdened}
          />
        </div>
      </div>

      <WorkspaceSelectionModal
        isOpen={showWorkspaceModal}
        onClose={() => {
          if (selectionMade) {
            setShowWorkspaceModal(false);
          } else {
            router.push("/");
          }
        }}
        workspaces={workspaces}
        onSelect={handleWorkspaceSelect}
        onCreate={addWorkspaceOp}
        onUpdate={updateWorkspaceOp}
        onDelete={deleteWorkspaceOp}
        initialView={workspaceModalView}
      />

      {viewMode === "matrix" ? (
        <>
          <div id="matrix-task-form">
            <MainTaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              newEstimatedMinutes={newEstimatedMinutes}
              setNewEstimatedMinutes={setNewEstimatedMinutes}
              handleAddTask={handleAddTask}
            />
          </div>

          <div id="matrix-grid-container">
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
              setEditingReminderMinutes={setEditingReminderMinutes}
              setEditingDateTaskId={setEditingDateTaskId}
              setAssignmentModal={setAssignmentModal}
              QUAD_CONFIG={QUADRANTS}
            />
          </div>
        </>
      ) : (
        <CalendarView
          tasks={tasks}
          onTaskClick={(task) => {
            setEditingContentTaskId(task.id);
            setEditingContentValue(task.content);
            setEditingEstimatedMinutes(task.estimatedMinutes?.toString() || "");
            setEditingReminderMinutes(
              task.reminderMinutesBefore?.toString() || "",
            );
          }}
        />
      )}

      <footer className="mt-16 py-8 text-center relative z-10 group">
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 font-sans">
          Turning mental models into action
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 tracking-tight">
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
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-extrabold hover:opacity-80 transition-opacity cursor-pointer inline-block"
            >
              Kaushal Soni
            </a>
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <a
            href="https://www.linkedin.com/in/sonikaushal/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all shadow-sm"
            title="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://github.com/kush95300/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm"
            title="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://flowcv.me/kaushal-soni"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-md transition-all shadow-sm"
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
            tasks.find((t: Task) => t.id === completingTaskId)?.content || ""
          }
          estimatedMinutes={
            tasks.find((t: Task) => t.id === completingTaskId)
              ?.estimatedMinutes || null
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
          setAssignmentModal={setAssignmentModal}
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
          setIsTestMode={() => selectWorkspaceOp(null)}
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
          editingReminderMinutes={editingReminderMinutes}
          setEditingReminderMinutes={setEditingReminderMinutes}
          warningMessage={modalWarning}
          onClose={() => {
            setEditingContentTaskId(null);
            setEditingContentValue("");
            setEditingEstimatedMinutes("");
            setEditingReminderMinutes("");
            setModalWarning(null);
          }}
          saveTaskContent={saveTaskContent}
        />
      )}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        maxDailyMinutes={maxDailyMinutes}
        onUpdateMaxMinutes={updateMaxMinutesOp}
      />
      <ResetConfirmModal
        isOpen={!!showResetModal}
        resetType={showResetModal}
        onClose={() => setShowResetModal(null)}
        onConfirm={handleConfirmReset}
      />

      {showPageTutorial && !showWorkspaceModal && activeWorkspaceId !== null && (
        <PageTutorial
          pageKey="eisenhower"
          steps={activeTutorialSteps}
          onClose={(completed) => {
            setShowPageTutorial(false);
            if (selectedTutorialType === "addDelegate") {
              setShowDelegateModal(false);
            }
            if (completed) {
              setShowTutorialCompletionModal(true);
            }
          }}
          onDontShowAgain={(val) => {
            const username = user?.username || "guest";
            if (val) {
              localStorage.setItem(`tutorial_dismissed_eisenhower_${username}`, "true");
            } else {
              localStorage.removeItem(`tutorial_dismissed_eisenhower_${username}`);
            }
          }}
          onStepChange={(index) => {
            if (selectedTutorialType === "addDelegate") {
              if (index === 1 || index === 2) {
                setShowDelegateModal(true);
              } else {
                setShowDelegateModal(false);
              }
            }
          }}
        />
      )}

      {showVideoTour && (
        <VideoTourPlayer
          onClose={() => {
            setShowVideoTour(false);
            const username = user?.username || "guest";
            localStorage.setItem(`tour_dismissed_${username}`, "true");
            
            if (!selectionMade) {
              router.push("/");
              return;
            }

            // Auto chain page tutorial if not dismissed yet and NOT manually clicked
            if (!isManualTour) {
              const dismissedPage = localStorage.getItem(`tutorial_dismissed_eisenhower_${username}`);
              if (!dismissedPage) {
                setShowPageTutorial(true);
              }
            }
            setIsManualTour(false); // Reset manual trigger flag
          }}
          onDontShowAgain={(val) => {
            const username = user?.username || "guest";
            if (val) {
              localStorage.setItem(`tour_dismissed_${username}`, "true");
            } else {
              localStorage.removeItem(`tour_dismissed_${username}`);
            }
          }}
          excludeTrackIds={[1]}
        />
      )}

      {showTutorialCompletionModal && (
        <div className="fixed inset-0 z-[50700] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <CheckCircle2 size={24} className="animate-bounce" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">
              Walkthrough Completed! 🎉
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Great job! You have completed the tour. What would you like to do next? Choose from our quick interactive guides below.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSelectedTutorialType("main");
                  setShowPageTutorial(true);
                  setShowTutorialCompletionModal(false);
                }}
                className="w-full flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl text-indigo-700 dark:text-indigo-400 font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95"
              >
                <RotateCcw size={16} /> Redo Main Walkthrough
              </button>
              
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 mb-1 ml-1">
                Interactive Guides
              </div>

              <button
                onClick={() => {
                  setSelectedTutorialType("addTask");
                  setNewTask("Sample Task: Learn Eisenhower Matrix");
                  setNewEstimatedMinutes("45");
                  setShowPageTutorial(true);
                  setShowTutorialCompletionModal(false);
                }}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-all hover:scale-[1.01] active:scale-95"
              >
                <PlusCircle size={16} className="text-indigo-500" /> How to Add a Task
              </button>

              <button
                onClick={async () => {
                  const selfDel = delegates.find(d => d.name.toLowerCase() === "self");
                  const activeTasks = tasks.filter(t => !t.isDeleted && t.status !== "DONE");
                  if (activeTasks.length === 0) {
                    await addTask("Sample Task: Double-click to delegate", 30, selfDel?.id || null);
                  }
                  const hasOtherDel = delegates.some(d => d.name.toLowerCase() !== "self");
                  if (!hasOtherDel) {
                    await addDelegateOp("Alex (Product Designer)");
                  }
                  setSelectedTutorialType("addDelegate");
                  setShowPageTutorial(true);
                  setShowTutorialCompletionModal(false);
                }}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-all hover:scale-[1.01] active:scale-95"
              >
                <UserCog size={16} className="text-amber-500" /> How to Add a Delegate
              </button>

              {!isTestMode && (
                <button
                  onClick={() => {
                    setSelectedTutorialType("analytics");
                    setShowPageTutorial(true);
                    setShowTutorialCompletionModal(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-all hover:scale-[1.01] active:scale-95"
                >
                  <BarChart3 size={16} className="text-emerald-500" /> How to Use Analytics
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => setShowTutorialCompletionModal(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 text-center cursor-pointer"
              >
                Done / Go to App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estimated Minutes Input in Edit Modal - Since I can't easily edit the EditContentModal again without another write, I'll add a temporary overlay or just update it now */}
    </div>
  );
}

// Re-writing the EditContentModal inline or adding the duration input to the existing one.
// Actually, I'll just write a better EditContentModal in the first place or update it now.
