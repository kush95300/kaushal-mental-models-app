"use server";

import prisma from "@/lib/prisma";

export interface AnalyticsData {
  distribution: { name: string; value: number; color: string }[];
  velocity: { date: string; count: number }[];
  delegation: { name: string; value: number }[];
  summary: {
    totalActive: number;
    totalCompleted: number;
    completionRate: number;
    avgCompletionTime: number; // in hours
  };
}

export async function getAnalyticsData(
  workspaceId: number,
): Promise<{ success: boolean; data?: AnalyticsData; error?: string }> {
  try {
    // 1. Quadrant Distribution (Active Tasks)
    const activeTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        isDeleted: false,
        status: "TODO",
      },
      select: { quadrant: true },
    });

    const distributionMap = {
      DO: 0,
      SCHEDULE: 0,
      DELEGATE: 0,
      ELIMINATE: 0,
      INBOX: 0,
    };

    activeTasks.forEach((t) => {
      if (t.quadrant in distributionMap) {
        distributionMap[t.quadrant as keyof typeof distributionMap]++;
      }
    });

    const distribution = [
      { name: "Do", value: distributionMap.DO, color: "#f43f5e" }, // Rose-500
      { name: "Schedule", value: distributionMap.SCHEDULE, color: "#6366f1" }, // Indigo-500
      { name: "Delegate", value: distributionMap.DELEGATE, color: "#f59e0b" }, // Amber-500
      { name: "Eliminate", value: distributionMap.ELIMINATE, color: "#64748b" }, // Slate-500
    ].filter((i) => i.value > 0);

    // 2. Velocity (Last 14 Days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const completedTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        isDeleted: false,
        status: "DONE",
        completedAt: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        completedAt: true,
        actualMinutes: true,
        estimatedMinutes: true,
      },
      orderBy: { completedAt: "asc" },
    });

    const velocityMap = new Map<string, number>();
    // Initialize last 14 days with 0
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      velocityMap.set(dateStr, 0);
    }

    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const dateStr = new Date(t.completedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (velocityMap.has(dateStr)) {
          velocityMap.set(dateStr, (velocityMap.get(dateStr) || 0) + 1);
        }
      }
    });

    // Convert map to array and reverse to chronological order
    const velocity = Array.from(velocityMap, ([date, count]) => ({
      date,
      count,
    })).reverse();

    // 3. Delegation Stats
    const delegatedTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        isDeleted: false,
        delegate: {
          name: {
            notIn: ["Self", "self", "SELF"],
          },
        },
      },
      include: { delegate: true },
    });

    const delegationMap: Record<string, number> = {};
    delegatedTasks.forEach((t) => {
      const name = t.delegate?.name || "Unknown";
      delegationMap[name] = (delegationMap[name] || 0) + 1;
    });

    const delegation = Object.entries(delegationMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 4. Summary Stats
    const totalCompletedAllTime = await prisma.task.count({
      where: { workspaceId, status: "DONE", isDeleted: false },
    });

    // Calc Avg Completion Speed (if data exists)
    // We can use the fetched 'completedTasks' (last 14 days) as a sample, or fetch a larger sample if needed.
    // Let's rely on the 14-day sample for "Recent Performance"
    let totalMinutes = 0;
    let countWithTime = 0;
    completedTasks.forEach((t) => {
      if (t.actualMinutes) {
        totalMinutes += t.actualMinutes;
        countWithTime++;
      }
    });

    const avgCompletionTime =
      countWithTime > 0
        ? Math.round((totalMinutes / countWithTime / 60) * 10) / 10
        : 0; // Hours

    return {
      success: true,
      data: {
        distribution,
        velocity,
        delegation,
        summary: {
          totalActive: activeTasks.length,
          totalCompleted: totalCompletedAllTime, // All time
          completionRate:
            activeTasks.length > 0
              ? Math.round(
                  (totalCompletedAllTime /
                    (totalCompletedAllTime + activeTasks.length)) *
                    100,
                )
              : 0,
          avgCompletionTime,
        },
      },
    };
  } catch (error) {
    console.error("Analytics error:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}
