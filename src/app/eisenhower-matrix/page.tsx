"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Info,
  Move,
  Flame,
  Calendar,
  Users,
  Wind,
  PlusCircle,
  Lightbulb,
  ArrowLeft,
  UserPlus,
  X,
  UserCog,
  HelpCircle,
  Target,
  Zap,
  Clock,
  Users2,
  Pencil,
} from "lucide-react";

interface Delegate {
  id: number;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  content: string;
  quadrant: string;
  status: string;
  isImportant: boolean;
  isUrgent: boolean;
  dueDate?: string;
  completedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  delegate?: Delegate;
}

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
    description: "Distractions and time-wasters.",
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [newTask, setNewTask] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [showDoneList, setShowDoneList] = useState(false);
  const [showDeletedList, setShowDeletedList] = useState(false);

  const [newDelegateName, setNewDelegateName] = useState("");
  const [config, setConfig] = useState<{
    analyticsStartDate: string | null;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
    fetchDelegates();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (searchParams.get("showHelp") === "true") {
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

  const fetchConfig = async () => {
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
  };

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

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
    setLoading(false);
  };

  const fetchDelegates = async () => {
    try {
      const res = await fetch("/api/delegates");
      if (res.ok) {
        const data = await res.json();
        setDelegates(data);
      }
    } catch (error) {
      console.error("Fetch delegates error:", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      if (isTestMode) {
        const tempTask = {
          id: Math.random(),
          content: newTask,
          isImportant: false,
          isUrgent: false,
          quadrant: "INBOX",
          status: "TODO",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          delegate: delegates.find((d) => d.name === "Self") || delegates[0],
        };
        setTasks([tempTask as any, ...tasks]);
        setNewTask("");
        return;
      }
      const selfDelegate = delegates.find(
        (d) => d.name.toLowerCase() === "self",
      );
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newTask,
          quadrant: "INBOX",
          delegateId: selfDelegate?.id || null,
        }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks([task, ...tasks]);
        setNewTask("");
      }
    } catch (error) {
      console.error("Add task error:", error);
    }
  };

  const deleteTask = async (id: number) => {
    // Optimistic update for soft delete
    setTasks(tasks.map((t) => (t.id === id ? { ...t, isDeleted: true } : t)));

    if (isTestMode) return;
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Delete task error:", error);
      // Revert on error
      fetchTasks();
    }
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    if (isTestMode) return;

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Update task error:", error);
    }
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

    // If quadrant is DO, SCHEDULE, or DELEGATE, show assignment logic
    if (
      quadrantId === "DO" ||
      quadrantId === "SCHEDULE" ||
      quadrantId === "DELEGATE"
    ) {
      setAssignmentModal({ taskId: draggedTaskId, quadrant: quadrantId });
    } else {
      // Otherwise just move
      updateTaskQuadrant(draggedTaskId, quadrantId);
    }

    setDraggedTaskId(null);
    setActiveQuadrant(null);
  };

  const updateTaskQuadrant = async (
    taskId: number,
    quadrant: string,
    additionalData: any = {},
  ) => {
    // Constraint: Assignment logic based on Quadrant
    if (quadrant !== "DELEGATE") {
      // Auto-assign to "Self" for active quadrants (DO, SCHEDULE, ELIMINATE, INBOX)
      const selfDelegate = delegates.find(
        (d) => d.name.toLowerCase() === "self",
      );
      if (selfDelegate) {
        additionalData.delegateId = selfDelegate.id;
      }
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedTask = { ...t, quadrant, ...additionalData };
          // If delegateId is being updated, find the delegate object for UI
          if (additionalData.delegateId) {
            const newDelegate = delegates.find(
              (d) => d.id === additionalData.delegateId,
            );
            if (newDelegate) {
              updatedTask.delegate = newDelegate;
            }
          }
          // If delegateId is explicitly null (removing delegate), clear the delegate object
          if (additionalData.delegateId === null) {
            updatedTask.delegate = null;
          }
          return updatedTask;
        }
        return t;
      }),
    );

    if (isTestMode) return;

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, quadrant, ...additionalData }),
      });
      // Re-fetch to ensure relations (like delegate name) are updated
      fetchTasks();
    } catch (error) {
      console.error("Update task error:", error);
    }
    setAssignmentModal(null);
  };

  const saveTaskContent = async () => {
    if (!editingContentTaskId || !editingContentValue.trim()) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingContentTaskId
          ? { ...t, content: editingContentValue }
          : t,
      ),
    );

    const idToSave = editingContentTaskId;
    const contentToSave = editingContentValue;
    setEditingContentTaskId(null);
    setEditingContentValue("");

    if (isTestMode) return;

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idToSave, content: contentToSave }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Update task content error:", error);
    }
  };

  // Delegate Management
  const addDelegate = async () => {
    if (!newDelegateName.trim()) return;
    if (isTestMode) {
      const tempDelegate = {
        id: Math.random(),
        name: newDelegateName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDelegates([...delegates, tempDelegate as any]);
      setNewDelegateName("");
      return;
    }
    try {
      const res = await fetch("/api/delegates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDelegateName }),
      });
      if (res.ok) {
        const d = await res.json();
        setDelegates([...delegates, d]);
        setNewDelegateName("");
      }
    } catch (error) {
      console.error("Add delegate error:", error);
    }
  };

  const removeDelegate = async (id: number) => {
    setDelegates(delegates.filter((d) => d.id !== id));
    if (isTestMode) return;
    try {
      const res = await fetch(`/api/delegates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDelegates(delegates.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Remove delegate error:", error);
    }
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

    if (isTestMode) {
      if (type === "all") {
        setTasks([]);
      } else {
        const today = new Date().toDateString();
        setTasks(
          tasks.filter((t) => new Date(t.createdAt).toDateString() !== today),
        );
      }
      return;
    }

    try {
      const res = await fetch(`/api/tasks?reset=${type}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Reset error:", error);
    }
  };

  const revertDeletion = async (id: number) => {
    // Optimistic update
    setTasks(tasks.map((t) => (t.id === id ? { ...t, isDeleted: false } : t)));

    if (isTestMode) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}&mode=revert`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fetchTasks(); // Revert if failed
      }
    } catch (error) {
      console.error("Revert error:", error);
      fetchTasks();
    }
  };

  const hardDeleteTask = async (id: number) => {
    if (!confirm("Permanently delete this item?")) return;
    if (isTestMode) {
      setTasks(tasks.filter((t) => t.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/tasks?id=${id}&mode=hard`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Hard delete error:", error);
    }
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

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className={`group flex items-center gap-3 p-3 mb-2 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 hover:scale-[1.01] active:scale-[0.98] ${
        task.status === "DONE" ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={() => toggleComplete(task.id)}
        className="flex-shrink-0 transition-transform duration-200 hover:scale-125"
      >
        {task.status === "DONE" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300" />
        )}
      </button>

      <div className="flex-grow min-w-0">
        <span
          className={`block text-sm font-medium truncate transition-all duration-300 ${
            task.status === "DONE"
              ? "line-through text-slate-400"
              : "text-slate-700"
          }`}
        >
          {task.content}
        </span>
        {task.dueDate && (
          <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" /> Due{" "}
            {new Date(task.dueDate).toLocaleDateString()}
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
          onClick={() => {
            setEditingContentTaskId(task.id);
            setEditingContentValue(task.content);
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
          title="Edit Content"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {task.quadrant !== "INBOX" && (
          <button
            onClick={() => setEditingDateTaskId(task.id)}
            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title="Change Due Date"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
        {task.quadrant === "DELEGATE" && (
          <button
            onClick={() =>
              setAssignmentModal({ taskId: task.id, quadrant: "DELEGATE" })
            }
            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors duration-200"
            title="Reassign Delegate"
          >
            <UserCog className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors duration-200"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const Quadrant = ({ qConfig }: { qConfig: any }) => {
    const quadrantTasks = tasks.filter(
      (t) => t.quadrant === qConfig.id && !t.isDeleted && t.status !== "DONE",
    );
    const isActive = activeQuadrant === qConfig.id;

    return (
      <div
        className={`relative flex flex-col h-full min-h-[300px] rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
          isActive
            ? "scale-[1.02] border-indigo-400 shadow-2xl z-10 bg-white"
            : qConfig.borderColor +
              " bg-white/60 backdrop-blur-md shadow-lg shadow-slate-200/50"
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
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full ${qConfig.color} bg-opacity-10 ${qConfig.textColor} animate-pulse`}
          >
            {quadrantTasks.length}
          </span>
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
            quadrantTasks.map((task) => <TaskCard key={task.id} task={task} />)
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
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
            Back to Models
          </Link>
          <div className="flex items-center gap-2">
            {isTestMode && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest mr-2 animate-pulse">
                <Zap size={12} className="fill-amber-500" /> Test Mode
              </div>
            )}
            <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white items-center gap-1 shadow-sm">
              <button
                onClick={() => setShowDoneList(true)}
                className="p-2 px-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                title="View Completed Tasks"
              >
                <CheckCircle2 size={16} /> Done
              </button>
              <button
                onClick={() => setShowDeletedList(true)}
                className="p-2 px-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                title="View Deleted Tasks"
              >
                <Trash2 size={16} /> Trash
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
              onClick={() => setShowDelegateModal(true)}
              className="flex items-center gap-2 text-amber-500 hover:text-amber-600 font-black text-[10px] uppercase tracking-widest transition-all bg-white/80 p-2.5 px-4 rounded-2xl border border-white shadow-sm hover:shadow-md"
            >
              <UserCog size={14} /> Manage Delegates
            </button>
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Eisenhower
                Matrix
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <Calendar className="w-3 h-3" />{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">
                Focus{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
                  Matrix
                </span>
              </h1>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-xl font-black text-indigo-600 leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Done
                  </span>
                  <span className="text-xl font-black text-emerald-600 leading-none">
                    {stats.completed}
                  </span>
                </div>
                <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                    Pending
                  </span>
                  <span className="text-xl font-black text-rose-600 leading-none">
                    {stats.pending}
                  </span>
                </div>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Eliminated
                  </span>
                  <span className="text-xl font-black text-slate-600 leading-none">
                    {stats.eliminated}
                  </span>
                </div>
                <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    Delegated
                  </span>
                  <span className="text-xl font-black text-amber-600 leading-none">
                    {stats.delegated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-4 px-6 rounded-[2rem] border border-white/80 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl">
            <div className="flex flex-col gap-1 pr-6 border-r border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Focus Depth
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="50"
                  value={visibleLimit}
                  onChange={(e) => setVisibleLimit(parseInt(e.target.value))}
                  className="w-24 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all hover:accent-purple-600"
                />
                <span className="text-xs font-black text-indigo-600 w-4">
                  {visibleLimit}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Momentum
              </span>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.completed / (stats.total || 1)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-black text-indigo-600 tabular-nums">
                  {stats.total > 0
                    ? Math.round((stats.completed / (stats.total || 1)) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-7 shadow-2xl shadow-indigo-100/50 border border-white/80">
            <h2 className="text-xl font-black mb-5 text-slate-800 flex items-center gap-3">
              <PlusCircle className="w-6 h-6 text-indigo-500" /> New Task
            </h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Capture a thought..."
                className="w-full px-5 py-4 rounded-2xl bg-white/80 border-slate-200 border-2 focus:border-indigo-400 focus:ring-0 transition-all text-sm font-bold shadow-inner placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={!newTask.trim()}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add to Inbox
              </button>
            </form>
          </div>

          <div
            className={`flex-grow bg-slate-100/30 backdrop-blur-sm rounded-[2.5rem] p-7 border-2 border-dashed transition-all duration-500 min-h-[350px] ${
              activeQuadrant === "INBOX"
                ? "border-indigo-400 bg-indigo-50/50 scale-[1.02]"
                : "border-slate-300/50 hover:bg-slate-100/50"
            }`}
            onDragOver={(e) => onDragOver(e, "INBOX")}
            onDrop={(e) => onDrop(e, "INBOX")}
          >
            <h2 className="text-xs font-black mb-6 text-slate-400 uppercase tracking-[0.2em]">
              Draft Queue
            </h2>
            <div
              className="space-y-3 overflow-y-auto custom-scrollbar pr-1 scroll-smooth"
              style={{ maxHeight: `${visibleLimit * 54 + 16}px` }}
            >
              {tasks.filter(
                (t) => t.quadrant === "INBOX" && t.status !== "DONE",
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 opacity-30 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                    <Move className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] font-bold uppercase text-center leading-relaxed">
                    Drag back here to
                    <br />
                    park your tasks
                  </p>
                </div>
              ) : (
                tasks
                  .filter((t) => t.quadrant === "INBOX" && t.status !== "DONE")
                  .map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <Quadrant qConfig={QUADRANTS.DO} />
            <Quadrant qConfig={QUADRANTS.SCHEDULE} />
            <Quadrant qConfig={QUADRANTS.DELEGATE} />
            <Quadrant qConfig={QUADRANTS.ELIMINATE} />
          </div>
        </div>
      </div>

      <footer className="mt-16 py-8 text-center relative z-10 group">
        <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
          Turning mental models into action
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200" />
          <p className="text-xs font-bold text-slate-500 tracking-tight">
            Created with{" "}
            <span className="text-rose-500 animate-pulse inline-block mx-0.5">
              ❤️
            </span>{" "}
            by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold">
              Kaushal Soni
            </span>
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200" />
        </div>
      </footer>

      {/* Educational Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600">
                  <Target size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    The Eisenhower Matrix
                  </h3>
                  <p className="text-sm font-semibold text-indigo-600/70 uppercase tracking-widest">
                    Mastering the Art of Prioritization
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseHelp}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={28} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-10 bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50">
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                The{" "}
                <span className="text-indigo-600 font-black">
                  Eisenhower Matrix
                </span>{" "}
                is a legendary time management framework that helps you
                distinguish between tasks that are{" "}
                <span className="italic font-bold text-rose-500">Urgent</span>{" "}
                and those that are truly{" "}
                <span className="italic font-bold text-indigo-500">
                  Important
                </span>
                . By categorizing your workload into four quadrants, you can
                escape the "Urgency Trap," stop reacting to noise, and start
                investing your energy in deep work, strategic planning, and
                long-term growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Q1 */}
              <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
                    <Zap size={18} />
                  </div>
                  <h4 className="font-black text-rose-700 uppercase tracking-wider text-sm">
                    Quadrant 1: Do First
                  </h4>
                </div>
                <p className="text-xs font-bold text-rose-600/80 mb-4 tracking-tight">
                  URGENT & IMPORTANT
                </p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Tasks that require immediate action. These are crises,
                  deadlines, or pressing problems.
                  <br />
                  <br />
                  <span className="text-[10px] font-black uppercase text-rose-500 bg-white/50 px-2 py-1 rounded-md">
                    Strategy: Do it now
                  </span>
                </p>
              </div>

              {/* Q2 */}
              <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200">
                    <Clock size={18} />
                  </div>
                  <h4 className="font-black text-indigo-700 uppercase tracking-wider text-sm">
                    Quadrant 2: Schedule
                  </h4>
                </div>
                <p className="text-xs font-bold text-indigo-600/80 mb-4 tracking-tight">
                  IMPORTANT BUT NOT URGENT
                </p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  The most critical quadrant for long-term growth. Planning,
                  study, exercise, and relationship building.
                  <br />
                  <br />
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-white/50 px-2 py-1 rounded-md">
                    Strategy: Schedule it
                  </span>
                </p>
              </div>

              {/* Q3 */}
              <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
                    <Users2 size={18} />
                  </div>
                  <h4 className="font-black text-amber-700 uppercase tracking-wider text-sm">
                    Quadrant 3: Delegate
                  </h4>
                </div>
                <p className="text-xs font-bold text-amber-600/80 mb-4 tracking-tight">
                  URGENT BUT NOT IMPORTANT
                </p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Tasks that feel pressing but don't contribute to your goals.
                  Meetings, phone calls, or emails.
                  <br />
                  <br />
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-white/50 px-2 py-1 rounded-md">
                    Strategy: Let others help
                  </span>
                </p>
              </div>

              {/* Q4 */}
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-slate-500 text-white rounded-xl shadow-lg shadow-slate-200">
                    <Trash2 size={18} />
                  </div>
                  <h4 className="font-black text-slate-700 uppercase tracking-wider text-sm">
                    Quadrant 4: Eliminate
                  </h4>
                </div>
                <p className="text-xs font-bold text-slate-600/80 mb-4 tracking-tight">
                  NEITHER URGENT NOR IMPORTANT
                </p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Time-wasters and distractions. Avoid these as much as possible
                  to stay focused.
                  <br />
                  <br />
                  <span className="text-[10px] font-black uppercase text-slate-500 bg-white/50 px-2 py-1 rounded-md">
                    Strategy: Stop doing
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-center">
              <p className="text-sm text-slate-300 font-bold italic">
                "What is important is seldom urgent and what is urgent is seldom
                important."
              </p>
              <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-widest">
                — Dwight D. Eisenhower
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modals / Popovers */}
      {assignmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {assignmentModal.quadrant === "DELEGATE"
                    ? "Delegate Task"
                    : assignmentModal.quadrant === "DO"
                    ? "Plan Execution"
                    : assignmentModal.quadrant === "SCHEDULE"
                    ? "Schedule Task"
                    : "Confirm Action"}
                </h3>
                <p className="text-sm font-semibold text-indigo-600/70 italic">
                  "
                  {tasks.find((t) => t.id === assignmentModal?.taskId)?.content}
                  "
                </p>
              </div>
              <button
                onClick={() => setAssignmentModal(null)}
                className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {assignmentModal.quadrant === "DELEGATE" && (
                <div>
                  <p className="text-slate-500 font-medium mb-4">
                    Who should handle this task?
                  </p>
                  {delegates.filter((d) => d.name !== "Self").length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                      <p className="text-[10px] font-black text-amber-700 uppercase mb-3">
                        No team members added yet
                      </p>
                      <button
                        onClick={() => setShowDelegateModal(true)}
                        className="w-full py-4 mb-2 rounded-2xl bg-white border-2 border-dashed border-amber-300 text-amber-600 font-bold text-xs uppercase tracking-widest hover:bg-amber-50 hover:border-amber-500 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} /> Add Team Member
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date();
                          updateTaskQuadrant(assignmentModal!.taskId, "DO", {
                            dueDate: today.toISOString(),
                          });
                        }}
                        className="w-full py-4 rounded-2xl bg-amber-50 border-2 border-amber-100 text-amber-600 font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-all"
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
                            onClick={() =>
                              updateTaskQuadrant(
                                assignmentModal!.taskId,
                                "DELEGATE",
                                { delegateId: d.id },
                              )
                            }
                            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 hover:border-amber-400 hover:bg-white transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                              <Users size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-xs uppercase tracking-wide text-slate-700">
                                {d.name}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const today = new Date();
                      updateTaskQuadrant(assignmentModal.taskId, "DO", {
                        dueDate: today.toISOString(),
                      });
                    }}
                    className="p-6 rounded-3xl bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white transition-all group text-left"
                  >
                    <span className="block text-xl font-black mb-1 group-hover:text-white text-indigo-900">
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
                    }}
                    className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-400 hover:bg-white transition-all text-left"
                  >
                    <span className="block text-xl font-black mb-1 text-slate-700">
                      Tomorrow
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Medium Priority
                    </span>
                  </button>
                </div>
              )}

              {assignmentModal.quadrant === "SCHEDULE" && (
                <div className="flex flex-col gap-4">
                  <p className="text-slate-500 font-medium">
                    Select a date to commit to this task.
                  </p>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-emerald-500 font-bold text-slate-700"
                    onChange={(e) => {
                      if (e.target.value) {
                        updateTaskQuadrant(assignmentModal.taskId, "SCHEDULE", {
                          dueDate: new Date(e.target.value).toISOString(),
                        });
                      }
                    }}
                  />
                </div>
              )}

              {(assignmentModal.quadrant === "ELIMINATE" ||
                assignmentModal.quadrant === "INBOX") && (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() =>
                      updateTaskQuadrant(
                        assignmentModal!.taskId,
                        assignmentModal!.quadrant,
                        { delegateId: null },
                      )
                    }
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 hover:border-indigo-400 hover:bg-white transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Target size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs uppercase tracking-wide text-slate-700">
                        Confirm Assignment
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Add to {assignmentModal?.quadrant}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delegate Management Modal */}
      {showDelegateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                  <UserCog size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Manage Delegates
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Build your high-performance team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDelegateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 p-2 bg-slate-50 rounded-[2rem] border-2 border-slate-100 focus-within:border-amber-200 transition-all">
                <input
                  type="text"
                  value={newDelegateName}
                  onChange={(e) => setNewDelegateName(e.target.value)}
                  placeholder="Enter teammate name..."
                  className="flex-grow px-4 bg-transparent outline-none font-bold text-sm placeholder:text-slate-300"
                />
                <button
                  onClick={addDelegate}
                  className="p-3 px-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg active:scale-95"
                >
                  Add Team Member
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {delegates.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center opacity-30">
                    <UserPlus size={48} className="mb-4 text-slate-300" />
                    <p className="font-bold uppercase text-[10px] tracking-[0.2em] text-center">
                      Your bench is empty.
                      <br />
                      Add teammates above.
                    </p>
                  </div>
                ) : (
                  delegates.map((delegate) => (
                    <div
                      key={delegate.id}
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl group/item hover:border-amber-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm">
                          {delegate.name.charAt(0)}
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-slate-700">
                          {delegate.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeDelegate(delegate.id)}
                        disabled={delegate.name === "Self"}
                        className={`p-2 rounded-xl transition-all opacity-0 group-hover/item:opacity-100 ${
                          delegate.name === "Self"
                            ? "text-slate-200 cursor-not-allowed"
                            : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white animate-in zoom-in-95 duration-500 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 ring-8 ring-indigo-50/50">
              <Target size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Ready to Master Your Time?
            </h2>
            <p className="text-slate-500 font-semibold mb-8 leading-relaxed">
              To provide accurate productivity analytics, we need to know when
              you're starting your journey. Would you like to set your tracking
              start date to today?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setAnalyticsStart(new Date().toISOString())}
                className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 hover:shadow-slate-300"
              >
                Yes, Start Today
              </button>
              <button
                onClick={() => {
                  setIsTestMode(true);
                  setShowOnboarding(false);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-white border border-slate-100 text-amber-600 font-bold hover:bg-amber-50 hover:border-amber-200 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
              >
                <Zap size={16} className="fill-amber-500" /> TRY IN TEST MODE
              </button>
              <button
                onClick={() => setAnalyticsStart(null)}
                className="w-full py-4 rounded-3xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all opacity-50"
              >
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Done Items Modal */}
      {showDoneList && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-white animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <CheckCircle2 className="text-emerald-500" /> Done Archive
              </h3>
              <button
                onClick={() => setShowDoneList(false)}
                className="p-2 hover:bg-slate-50 rounded-xl"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {tasks.filter((t) => t.status === "DONE" && !t.isDeleted)
                .length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  No completed items.
                </p>
              ) : (
                tasks
                  .filter((t) => t.status === "DONE" && !t.isDeleted)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <span className="text-sm font-bold text-slate-600 line-through opacity-50">
                        {task.content}
                      </span>
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className="px-4 py-2 bg-white border border-slate-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-md transition-all"
                      >
                        Restore to TODO
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deleted Items Modal */}
      {showDeletedList && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-white animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <Trash2 className="text-rose-500" /> Trash (Deleted)
              </h3>
              <button
                onClick={() => setShowDeletedList(false)}
                className="p-2 hover:bg-slate-50 rounded-xl"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {tasks.filter((t) => t.isDeleted).length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  Trash is empty.
                </p>
              ) : (
                tasks
                  .filter((t) => t.isDeleted)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <span className="text-sm font-bold text-slate-600">
                        {task.content}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => revertDeletion(task.id)}
                          className="px-4 py-2 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                        >
                          Revert
                        </button>
                        <button
                          onClick={() => hardDeleteTask(task.id)}
                          className="px-4 py-2 bg-white border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {editingDateTaskId !== null && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-slate-900">
                Set Due Date
              </h3>
              <button
                onClick={() => setEditingDateTaskId(null)}
                className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-slate-700"
                onChange={(e) => {
                  if (e.target.value) {
                    const task = tasks.find((t) => t.id === editingDateTaskId);
                    if (task) {
                      updateTaskQuadrant(editingDateTaskId, task.quadrant, {
                        dueDate: new Date(e.target.value).toISOString(),
                      });
                    }
                    setEditingDateTaskId(null);
                  }
                }}
              />
              <button
                onClick={() => {
                  const task = tasks.find((t) => t.id === editingDateTaskId);
                  if (task) {
                    updateTaskQuadrant(editingDateTaskId, task.quadrant, {
                      dueDate: null,
                    });
                  }
                  setEditingDateTaskId(null);
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Clear Date
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Content Modal */}
      {editingContentTaskId !== null && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Edit Task
            </h3>
            <textarea
              value={editingContentValue}
              onChange={(e) => setEditingContentValue(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-slate-700 min-h-[100px] mb-4"
              placeholder="Task content..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingContentTaskId(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveTaskContent}
                disabled={!editingContentValue.trim()}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
