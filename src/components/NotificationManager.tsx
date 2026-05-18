"use client";

import React, { useEffect } from "react";
import { Task, Workspace } from "@/types/eisenhower";

interface NotificationManagerProps {
  tasks: Task[];
  workspaces: Workspace[];
  activeWorkspaceId: number | null;
  updateTaskStatus: (id: number, status: string, minutes: number | null) => Promise<void>;
  // We should also be able to mark it as notified, but for simplicity, let's keep a local Set of notified task IDs
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  tasks,
  workspaces,
  activeWorkspaceId,
}) => {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const notifiedTaskIds = new Set<number>();
    const notifiedWorkspaceDates = new Set<string>(); // "YYYY-MM-DD-workspaceId"

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // 1. Workspace Daily Notification
      if (activeWorkspaceId) {
        const workspace = workspaces.find((w) => w.id === activeWorkspaceId);
        if (workspace && workspace.dailyNotificationTime === currentTimeStr) {
          const workspaceKey = `${todayStr}-${workspace.id}`;
          if (!notifiedWorkspaceDates.has(workspaceKey)) {
            new Notification(`Workspace: ${workspace.name}`, {
              body: `It's time to check your tasks for ${workspace.name}!`,
              icon: "/favicon.ico",
            });
            notifiedWorkspaceDates.add(workspaceKey);
          }
        }
      }

      // 2. Task Reminders
      tasks.forEach((task) => {
        if (task.status === "DONE" || task.isDeleted || !task.dueDate || !task.reminderMinutesBefore) return;

        if (notifiedTaskIds.has(task.id)) return;

        const dueTime = new Date(task.dueDate).getTime();
        const notifyTime = dueTime - task.reminderMinutesBefore * 60 * 1000;
        
        // Notify if we are past the notify time, but not past the due time
        // Give a 2-minute window to avoid stale notifications
        if (now.getTime() >= notifyTime && now.getTime() <= notifyTime + 2 * 60 * 1000) {
          new Notification("Task Reminder", {
            body: `Your task "${task.content}" is due in ${task.reminderMinutesBefore} minutes!`,
            icon: "/favicon.ico",
          });
          notifiedTaskIds.add(task.id);
        }
      });
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, workspaces, activeWorkspaceId]);

  return null;
};
