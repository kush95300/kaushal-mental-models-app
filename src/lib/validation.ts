export const MAX_CONTENT_LENGTH = 1000;
export const MAX_DELEGATE_NAME_LENGTH = 100;
export const VALID_QUADRANTS = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
export const VALID_STATUSES = ["TODO", "DONE"];

export function validateTaskContent(content: unknown): string | null {
  if (typeof content !== "string") {
    return "Task content must be a string";
  }
  if (!content.trim()) {
    return "Task content cannot be empty";
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return `Task content must be less than ${MAX_CONTENT_LENGTH} characters`;
  }
  return null;
}

export function validateQuadrant(quadrant: unknown): string | null {
  if (typeof quadrant !== "string") {
    return "Quadrant must be a string";
  }
  if (!VALID_QUADRANTS.includes(quadrant)) {
    return `Invalid quadrant. Must be one of: ${VALID_QUADRANTS.join(", ")}`;
  }
  return null;
}

export function validateStatus(status: unknown): string | null {
  if (typeof status !== "string") {
    return "Status must be a string";
  }
  if (!VALID_STATUSES.includes(status)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`;
  }
  return null;
}

export function validateDelegateName(name: unknown): string | null {
  if (typeof name !== "string") {
    return "Delegate name must be a string";
  }
  if (!name.trim()) {
    return "Delegate name cannot be empty";
  }
  if (name.length > MAX_DELEGATE_NAME_LENGTH) {
    return `Delegate name must be less than ${MAX_DELEGATE_NAME_LENGTH} characters`;
  }
  return null;
}

export function validateEmail(email: unknown): string | null {
  if (!email) return null; // Email is optional
  if (typeof email !== "string") {
    return "Email must be a string";
  }
  // Simple email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}
