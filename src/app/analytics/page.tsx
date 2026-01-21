import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights | The Wisdom Lab",
  description: "Productivity analytics and quadrant distribution.",
};

export default async function AnalyticsPage() {
  const config = await prisma.userConfig.findUnique({
    where: { id: 1 },
  });

  const workspaceId = config?.activeWorkspaceId || 1;

  return <AnalyticsDashboard workspaceId={workspaceId} />;
}
