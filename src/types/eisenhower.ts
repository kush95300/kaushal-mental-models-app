export interface Delegate {
  id: number;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
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
  dueDate?: string | null;
  completedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  delegate?: Delegate;
  delegateId?: number | null;
}
