export const VALID_QUADRANTS = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
export const VALID_STATUSES = ["TODO", "DONE"];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateTaskInput(data: {
  content?: string;
  quadrant?: string;
  status?: string;
}): ValidationResult {
  if (data.content !== undefined) {
    if (!data.content || typeof data.content !== "string") {
      return { isValid: false, error: "Task content is required" };
    }
    if (data.content.trim().length === 0) {
      return { isValid: false, error: "Task content cannot be empty" };
    }
    if (data.content.length > 1000) {
      return { isValid: false, error: "Task content cannot exceed 1000 characters" };
    }
  }

  if (data.quadrant !== undefined) {
    if (!VALID_QUADRANTS.includes(data.quadrant)) {
      return { isValid: false, error: "Invalid quadrant" };
    }
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      return { isValid: false, error: "Invalid status" };
    }
  }

  return { isValid: true };
}

export function validateDelegateInput(data: {
  name?: string;
  email?: string | null;
}): ValidationResult {
  if (data.name !== undefined) {
    if (!data.name || typeof data.name !== "string") {
      return { isValid: false, error: "Delegate name is required" };
    }
    if (data.name.trim().length === 0) {
      return { isValid: false, error: "Delegate name cannot be empty" };
    }
    if (data.name.length > 100) {
      return { isValid: false, error: "Delegate name cannot exceed 100 characters" };
    }
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: "Invalid email format" };
    }
  }

  return { isValid: true };
}
