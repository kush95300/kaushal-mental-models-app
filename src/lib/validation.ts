export const ALLOWED_QUADRANTS = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
export const ALLOWED_STATUSES = ["TODO", "DONE"];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTaskInput(data: {
  content?: string;
  quadrant?: string;
  status?: string;
  estimatedMinutes?: number | null;
}): ValidationResult {
  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      return { valid: false, error: "Content must be a string" };
    }
    const trimmedContent = data.content.trim();
    if (trimmedContent.length === 0) {
      return { valid: false, error: "Content cannot be empty" };
    }
    if (trimmedContent.length > 500) {
      return { valid: false, error: "Content is too long (max 500 characters)" };
    }
  }

  if (data.quadrant !== undefined && data.quadrant !== null) {
    if (!ALLOWED_QUADRANTS.includes(data.quadrant)) {
      return { valid: false, error: `Invalid quadrant. Allowed: ${ALLOWED_QUADRANTS.join(", ")}` };
    }
  }

  if (data.status !== undefined && data.status !== null) {
    if (!ALLOWED_STATUSES.includes(data.status)) {
      return { valid: false, error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` };
    }
  }

  if (data.estimatedMinutes !== undefined && data.estimatedMinutes !== null) {
     if (typeof data.estimatedMinutes !== 'number' || data.estimatedMinutes < 0) {
        return { valid: false, error: "Estimated minutes must be a positive number" };
     }
  }

  return { valid: true };
}
