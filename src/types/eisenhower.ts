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
  createdAt: string | Date;
  delegate?: Delegate | null;
  delegateId?: number | null;
  updatedAt?: string | Date;
}
