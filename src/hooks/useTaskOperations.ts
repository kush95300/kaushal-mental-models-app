import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  getWorkspaces,
  getUserConfig,
  updateActiveWorkspace,
  createWorkspace,
  updateWorkspace as updateWorkspaceAction,
  deleteWorkspace as deleteWorkspaceAction,
  updateMaxDailyMinutes,
} from "@/actions/workspace";
import { Workspace, UserConfig } from "@/types/eisenhower";

interface UseTaskOperationsProps {
  isTestMode: boolean;
}

export function useTaskOperations({
  isTestMode: initialIsTestMode,
}: UseTaskOperationsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(
    null,
  );
  const [isTestMode, setIsTestMode] = useState(initialIsTestMode);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [maxDailyMinutes, setMaxDailyMinutes] = useState(480);

  const dailyWorkload = useMemo(() => {
    return tasks
      .filter((t) => !t.isDeleted && t.quadrant === "DO" && t.status !== "DONE")
      .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  }, [tasks]);

  const isOverburdened = dailyWorkload > maxDailyMinutes;

  // Fetch Workspaces & Config
  const fetchWorkspaces = useCallback(async () => {
    try {
      if (isTestMode) {
        setWorkspaces([
          {
            id: 1,
            name: "Work",
            description: "Default work context",
            color: "indigo",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 2,
            name: "Personal",
            description: "Default personal context",
            color: "rose",
            createdAt: "",
            updatedAt: "",
          },
        ]);
        setActiveWorkspaceId(1);
        return;
      }
      const res = await getWorkspaces();
      if (res.success && res.data) {
        setWorkspaces(res.data);
      }
      const configRes = await getUserConfig();
      if (configRes.success && configRes.data) {
        if (!isTestMode) {
          const config = configRes.data as unknown as UserConfig;
          setActiveWorkspaceId(config.activeWorkspaceId);
          setMaxDailyMinutes(config.maxDailyMinutes);
        }
      }
    } catch (error) {
      console.error("Fetch workspaces error:", error);
    }
  }, [isTestMode]);

  // Fetch Delegates
  const fetchDelegates = useCallback(async () => {
    try {
      if (isTestMode) {
        setDelegates([
          {
            id: 1,
            name: "Self",
            email: null,
            createdAt: "",
            updatedAt: "",
          },
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

  // Fetch Tasks & Smart Scheduling
  const fetchTasks = useCallback(async () => {
    try {
      if (isTestMode || !activeWorkspaceId) {
        if (isTestMode) setLoading(false);
        return;
      }
      const res = await getTasks(activeWorkspaceId);
      if (res.success) {
        let data = res.data;

        // Auto-move tasks due today/tomorrow to DO quadrant
        let hasUpdates = false;
        const updates = data!.map(async (t: Task) => {
          if (!t.dueDate || t.status === "DONE" || t.quadrant === "DO")
            return t;

          if (shouldAutoPromote(t.dueDate)) {
            const isSelf =
              !t.delegate || t.delegate.name.toLowerCase() === "self";
            const targetQuadrant = isSelf ? "DO" : "DELEGATE";

            if (t.quadrant !== targetQuadrant) {
              hasUpdates = true;
              t.quadrant = targetQuadrant;
              await updateTaskAction(t.id, { quadrant: targetQuadrant });
            }
          }
          return t;
        });

        if (hasUpdates) {
          data = await Promise.all(updates);
        }
        if (data) {
          setTasks(data);
        }
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, [isTestMode, activeWorkspaceId]);

  useEffect(() => {
    fetchWorkspaces();
    fetchDelegates();
  }, [fetchWorkspaces, fetchDelegates]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
        workspaceId: activeWorkspaceId as number,
        dueDate: null,
        actualMinutes: null,
        delegateId: delegateId,
      };
      setTasks((prev) => [tempTask, ...prev]);
      return;
    }

    const res = await createTask({
      content,
      estimatedMinutes,
      delegateId,
      workspaceId: activeWorkspaceId as number,
    });
    if (res.success && res.data) {
      setTasks((prev) => [res.data as unknown as Task, ...prev]);
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
          ? ({
              ...t,
              status,
              actualMinutes: status === "TODO" ? null : actualMinutes,
            } as Task)
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
        t.id === taskId ? ({ ...t, quadrant, ...additionalData } as Task) : t,
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
      prev.map((t) =>
        t.id === id ? ({ ...t, content, estimatedMinutes } as Task) : t,
      ),
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

  const selectWorkspaceOp = async (id: number | null) => {
    if (id === null) {
      setIsTestMode(true);
      setActiveWorkspaceId(null);
      setTasks([]);
    } else {
      setIsTestMode(false);
      setActiveWorkspaceId(id);
      if (!isTestMode) {
        await updateActiveWorkspace(id);
      }
    }
  };

  const addWorkspaceOp = async (name: string, description: string) => {
    const res = await createWorkspace({ name, description });
    if (res.success && res.data) {
      setWorkspaces((prev) => [...prev, res.data as Workspace]);
    }
  };

  const updateWorkspaceOp = async (
    id: number,
    name: string,
    description: string,
  ) => {
    const res = await updateWorkspaceAction(id, { name, description });
    if (res.success && res.data) {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? (res.data as Workspace) : w)),
      );
    }
  };

  const deleteWorkspaceOp = async (id: number) => {
    const res = await deleteWorkspaceAction(id);
    if (res.success) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId(null);
      }
    }
  };

  const updateMaxMinutesOp = async (minutes: number) => {
    setMaxDailyMinutes(minutes);
    if (!isTestMode) {
      await updateMaxDailyMinutes(minutes);
    }
  };

  return {
    tasks,
    setTasks,
    delegates,
    setDelegates,
    workspaces,
    activeWorkspaceId,
    isTestMode,
    selectWorkspaceOp,
    addWorkspaceOp,
    updateWorkspaceOp,
    deleteWorkspaceOp,
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
    maxDailyMinutes,
    updateMaxMinutesOp,
    dailyWorkload,
    isOverburdened,
  };
}
