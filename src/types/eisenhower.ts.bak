export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserConfig {
  id: number;
  activeWorkspaceId: number;
  maxDailyMinutes: number;
  analyticsStartDate: string | Date | null;
  updatedAt: string | Date;
}

export interface Delegate {
  id: number;
  name: string;
  email: string | null | undefined;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Task {
  id: number;
  content: string;
  quadrant: string;
  status: string;
  isImportant: boolean;
  isUrgent: boolean;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  dueDate?: string | Date | null;
  completedAt?: string | Date | null;
  isDeleted: boolean;
  workspaceId: number;
  tags?: string | null;
  createdAt: string | Date;
  delegate?: Delegate | null;
  delegateId?: number | null;
  updatedAt?: string | Date;
}
