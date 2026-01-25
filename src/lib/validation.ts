
export interface ValidationResult {
  success: boolean;
  error?: string;
}

const VALID_QUADRANTS = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
const VALID_STATUSES = ["TODO", "DONE"];

export function validateTaskInput(data: {
  content?: string;
  quadrant?: string;
  status?: string;
  dueDate?: string | Date | null;
  estimatedMinutes?: number | null;
}): ValidationResult {
  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      return { success: false, error: "Content must be a string" };
    }
    const trimmed = data.content.trim();
    if (trimmed.length === 0) {
      return { success: false, error: "Content cannot be empty" };
    }
    if (trimmed.length > 1000) {
      return { success: false, error: "Content cannot exceed 1000 characters" };
    }
  }

  if (data.quadrant !== undefined) {
    if (!VALID_QUADRANTS.includes(data.quadrant)) {
      return { success: false, error: "Invalid quadrant" };
    }
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      return { success: false, error: "Invalid status" };
    }
  }

  if (data.dueDate) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Invalid due date" };
    }
  }

  if (data.estimatedMinutes !== undefined && data.estimatedMinutes !== null) {
    if (typeof data.estimatedMinutes !== "number" || data.estimatedMinutes < 0) {
      return { success: false, error: "Estimated minutes must be a non-negative number" };
    }
  }

  return { success: true };
}

export function validateDelegateInput(data: {
  name: string;
  email?: string;
}): ValidationResult {
  if (typeof data.name !== "string") {
    return { success: false, error: "Name must be a string" };
  }
  const trimmed = data.name.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Name cannot be empty" };
  }
  if (trimmed.length > 100) {
    return { success: false, error: "Name cannot exceed 100 characters" };
  }

  if (data.email) {
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Invalid email format" };
    }
  }

  return { success: true };
}
