
export function validateTaskContent(content: string): string | null {
  if (typeof content !== "string") {
    return "Content must be a string.";
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return "Content cannot be empty.";
  }
  if (trimmed.length > 1000) {
    return "Content cannot exceed 1000 characters.";
  }
  return null;
}

export function validateQuadrant(quadrant: string): string | null {
  const validQuadrants = [
    "INBOX",
    "DO",
    "SCHEDULE",
    "DELEGATE",
    "ELIMINATE",
  ];
  if (!validQuadrants.includes(quadrant)) {
    return `Invalid quadrant. Must be one of: ${validQuadrants.join(", ")}.`;
  }
  return null;
}

export function validateStatus(status: string): string | null {
  const validStatuses = ["TODO", "DONE"];
  if (!validStatuses.includes(status)) {
    return `Invalid status. Must be one of: ${validStatuses.join(", ")}.`;
  }
  return null;
}

export function validateEstimatedMinutes(minutes: number | null): string | null {
  if (minutes !== null && minutes < 0) {
    return "Estimated minutes cannot be negative.";
  }
  return null;
}
