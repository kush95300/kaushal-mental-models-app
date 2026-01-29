export function validateTaskInput(
  data: Partial<{
    content: string;
    isImportant: boolean;
    isUrgent: boolean;
    quadrant: string;
    dueDate: string | null;
    delegateId: number | null;
    estimatedMinutes: number | null;
    status: string;
  }>,
  isCreate: boolean = false
) {
  if (isCreate) {
    if (!data.content || typeof data.content !== "string") {
      return { success: false, error: "Content is required and must be a string" };
    }
  }

  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      return { success: false, error: "Content must be a string" };
    }
    const trimmed = data.content.trim();
    if (trimmed.length === 0) {
      return { success: false, error: "Content cannot be empty" };
    }
    if (data.content.length > 1000) {
      return { success: false, error: "Content cannot exceed 1000 characters" };
    }
  }

  if (data.estimatedMinutes !== undefined && data.estimatedMinutes !== null) {
    if (!Number.isInteger(data.estimatedMinutes) || data.estimatedMinutes < 0) {
      return {
        success: false,
        error: "Estimated minutes must be a non-negative integer",
      };
    }
  }

  if (data.quadrant !== undefined) {
    const validQuadrants = [
      "INBOX",
      "DO",
      "SCHEDULE",
      "DELEGATE",
      "ELIMINATE",
    ];
    if (!validQuadrants.includes(data.quadrant)) {
      return { success: false, error: "Invalid quadrant" };
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ["TODO", "DONE"];
    if (!validStatuses.includes(data.status)) {
      return { success: false, error: "Invalid status" };
    }
  }

  return { success: true };
}
