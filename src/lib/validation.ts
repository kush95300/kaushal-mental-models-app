export const VALID_QUADRANTS = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
export const VALID_STATUSES = ["TODO", "DONE"];

export interface ValidationResult {
  success: boolean;
  error?: string;
}

export function validateTaskInput(data: {
  content: string;
  quadrant?: string;
  status?: string;
}): ValidationResult {
  if (data.content === undefined || data.content === null) {
    return { success: false, error: "Content is required" };
  }

  if (typeof data.content !== "string") {
    return { success: false, error: "Content must be a string" };
  }

  if (data.content.trim().length === 0) {
    return { success: false, error: "Content cannot be empty" };
  }

  if (data.content.length > 1000) {
    return { success: false, error: "Content must be less than 1000 characters" };
  }

  if (data.quadrant && !VALID_QUADRANTS.includes(data.quadrant)) {
    return { success: false, error: `Invalid quadrant. Must be one of: ${VALID_QUADRANTS.join(", ")}` };
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    return { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` };
  }

  return { success: true };
}

export function validateTaskUpdate(data: Partial<{
  content: string;
  quadrant: string;
  status: string;
}>): ValidationResult {
  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      return { success: false, error: "Content must be a string" };
    }
    if (data.content.trim().length === 0) {
      return { success: false, error: "Content cannot be empty" };
    }
    if (data.content.length > 1000) {
      return { success: false, error: "Content must be less than 1000 characters" };
    }
  }

  if (data.quadrant && !VALID_QUADRANTS.includes(data.quadrant)) {
    return { success: false, error: `Invalid quadrant. Must be one of: ${VALID_QUADRANTS.join(", ")}` };
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    return { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` };
  }

  return { success: true };
}
