export function validateTaskContent(content: string): string | null {
  if (!content || typeof content !== "string" || !content.trim()) {
    return "Task content cannot be empty";
  }
  if (content.length > 1000) {
    return "Task content cannot exceed 1000 characters";
  }
  return null;
}

export function validateDelegateName(name: string): string | null {
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Delegate name cannot be empty";
  }
  if (name.length > 100) {
    return "Delegate name cannot exceed 100 characters";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return null; // Optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}

export function validateMinutes(minutes: number | null): string | null {
  if (minutes === null || minutes === undefined) return null;
  if (typeof minutes !== "number") return "Minutes must be a number";
  if (minutes < 0) return "Minutes cannot be negative";
  if (minutes > 1440) return "Minutes cannot exceed 24 hours (1440 mins)";
  return null;
}
