export const VALID_QUADRANTS = [
  "INBOX",
  "DO",
  "SCHEDULE",
  "DELEGATE",
  "ELIMINATE",
];
export const VALID_STATUSES = ["TODO", "DONE"];

export interface TaskValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateTaskInput(data: {
  content?: string;
  quadrant?: string;
  status?: string;
  estimatedMinutes?: number | null;
}): TaskValidationResult {
  // Validate Content
  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      return { isValid: false, error: "Content must be a string" };
    }
    const trimmedContent = data.content.trim();
    if (trimmedContent.length === 0) {
      return { isValid: false, error: "Content cannot be empty" };
    }
    if (trimmedContent.length > 1000) {
      return { isValid: false, error: "Content cannot exceed 1000 characters" };
    }
  }

  // Validate Quadrant
  if (data.quadrant !== undefined) {
    if (!VALID_QUADRANTS.includes(data.quadrant)) {
      return {
        isValid: false,
        error: `Invalid quadrant. Must be one of: ${VALID_QUADRANTS.join(", ")}`,
      };
    }
  }

  // Validate Status
  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      return {
        isValid: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      };
    }
  }

  // Validate Estimated Minutes
  if (
    data.estimatedMinutes !== undefined &&
    data.estimatedMinutes !== null
  ) {
    if (typeof data.estimatedMinutes !== "number") {
      return { isValid: false, error: "Estimated minutes must be a number" };
    }
    if (data.estimatedMinutes < 0) {
      return { isValid: false, error: "Estimated minutes cannot be negative" };
    }
    if (!Number.isInteger(data.estimatedMinutes)) {
      return { isValid: false, error: "Estimated minutes must be an integer" };
    }
  }

  return { isValid: true };
}
