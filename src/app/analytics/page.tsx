import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights | The Wisdom Lab",
  description: "Productivity analytics and quadrant distribution.",
};

interface AnalyticsPageProps {
  searchParams: Promise<{ workspaceId?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const paramWorkspaceId = params?.workspaceId ? parseInt(params.workspaceId) : null;
  const config = await prisma.userConfig.findUnique({
    where: { id: 1 },
  });

  const workspaceId = paramWorkspaceId || config?.activeWorkspaceId || 1;

  return <AnalyticsDashboard workspaceId={workspaceId} />;
}
