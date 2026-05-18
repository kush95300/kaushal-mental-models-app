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

import { getSession } from "@/lib/auth";

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const paramWorkspaceId = params?.workspaceId ? parseInt(params.workspaceId) : null;
  const session = await getSession();
  let activeWorkspaceId = 1;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });
    if (user?.activeWorkspaceId) {
      activeWorkspaceId = user.activeWorkspaceId;
    }
  }

  const workspaceId = paramWorkspaceId || activeWorkspaceId;

  return <AnalyticsDashboard workspaceId={workspaceId} />;
}
