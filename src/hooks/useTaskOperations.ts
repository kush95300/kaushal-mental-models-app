import { useState, useEffect, useCallback } from "react";
import { Task, Delegate } from "@/types/eisenhower";
import { shouldAutoPromote } from "@/lib/dateUtils";
import {
  getTasks,
  createTask,
  updateTask as updateTaskAction,
  deleteTaskAction,
  resetTasksAction,
} from "@/actions/task";
import {
  getDelegates,
  createDelegate,
  deleteDelegateAction,
} from "@/actions/delegate";

interface UseTaskOperationsProps {
  isTestMode: boolean;
}

export function useTaskOperations({ isTestMode }: UseTaskOperationsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch Delegates
  const fetchDelegates = useCallback(async () => {
    try {
      if (isTestMode) {
        setDelegates([
          { id: 1, name: "Self", email: null, createdAt: "", updatedAt: "" },
        ]);
        return;
      }
      const res = await getDelegates();
      if (res.success && res.data) {
        setDelegates(res.data);
      }
    } catch (error) {
      console.error("Fetch delegates error:", error);
    }
  }, [isTestMode]);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      if (isTestMode) {
        setLoading(false);
        return;
      }
      const res = await getTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, [isTestMode]);

  // Initial Load
  useEffect(() => {
    fetchTasks();
    fetchDelegates();
  }, [fetchTasks, fetchDelegates]);

  // Actions
  const addTask = async (
    content: string,
    estimatedMinutes: number | null,
    delegateId: number | null,
  ) => {
    if (!content.trim()) return;

    if (isTestMode) {
      const tempTask: Task = {
        id: Math.random(),
        content,
        estimatedMinutes,
        isImportant: false,
        isUrgent: false,
        quadrant: "INBOX",
        status: "TODO",
        createdAt: new Date().toISOString(),
        completedAt: null,
        delegate: delegateId
          ? delegates.find((d) => d.id === delegateId) || null
          : delegates[0] || null,
        isDeleted: false,
        dueDate: null,
        actualMinutes: null,
        delegateId: delegateId,
      };
      setTasks((prev) => [tempTask, ...prev]);
      return;
    }

    const res = await createTask({ content, estimatedMinutes, delegateId });
    if (res.success && res.data) {
      setTasks((prev) => [res.data!, ...prev]);
    }
  };

  const updateTaskStatus = async (
    id: number,
    status: string,
    actualMinutes: number | null,
  ) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              actualMinutes: status === "TODO" ? null : actualMinutes,
            }
          : t,
      ),
    );

    if (isTestMode) return;
    await updateTaskAction(id, { status, actualMinutes });
  };

  const updateTaskQuadrant = async (
    taskId: number,
    quadrant: string,
    additionalData: Partial<Task> = {},
  ) => {
    // Smart Scheduling Logic
    if (quadrant !== "DELEGATE") {
      const selfDelegate = delegates.find(
        (d) => d.name.toLowerCase() === "self",
      );
      if (selfDelegate) additionalData.delegateId = selfDelegate.id;
    }

    // Auto-schedule logic
    if (additionalData.dueDate && !isTestMode) {
      const task = tasks.find((t) => t.id === taskId);
      const isSelf =
        !task?.delegate || task.delegate.name.toLowerCase() === "self";
      if (isSelf && shouldAutoPromote(additionalData.dueDate)) {
        quadrant = "DO";
      }
    }

    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, quadrant, ...additionalData } : t,
      ),
    );

    if (isTestMode) return;
    const res = await updateTaskAction(taskId, { quadrant, ...additionalData });
    if (!res.success) {
      fetchTasks();
    }
  };

  const updateTaskContent = async (
    id: number,
    content: string,
    estimatedMinutes: number | null,
  ) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content, estimatedMinutes } : t)),
    );

    if (isTestMode) return;
    await updateTaskAction(id, { content, estimatedMinutes });
  };

  const deleteTask = async (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t)),
    );
    if (isTestMode) return;
    await deleteTaskAction(id, "soft");
  };

  const hardDeleteTask = async (id: number) => {
    if (!confirm("Permanently delete this item?")) return;
    if (isTestMode) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await deleteTaskAction(id, "hard");
    fetchTasks();
  };

  const revertDeletion = async (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: false } : t)),
    );
    if (isTestMode) return;
    await deleteTaskAction(id, "revert");
    fetchTasks();
  };

  const addDelegateOp = async (name: string, email?: string) => {
    if (isTestMode) {
      const tempDelegate: Delegate = {
        id: Math.random(),
        name,
        email: email || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDelegates((prev) => [...prev, tempDelegate]);
      return;
    }
    const res = await createDelegate({ name, email });
    if (res.success && res.data) {
      setDelegates((prev) => [...prev, res.data!]);
    }
  };

  const removeDelegateOp = async (id: number) => {
    setDelegates((prev) => prev.filter((d) => d.id !== id));
    if (isTestMode) return;
    const res = await deleteDelegateAction(id);
    if (!res.success) fetchDelegates();
  };

  const resetDataOp = async (type: "today" | "all") => {
    if (isTestMode) {
      setTasks([]);
      return;
    }
    const res = await resetTasksAction(type);
    if (res.success) fetchTasks();
  };

  return {
    tasks,
    setTasks,
    delegates,
    setDelegates,
    loading,
    lastRefreshed,
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
  };
}
