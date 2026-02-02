export function validateTaskContent(content: string): string | null {
  if (!content || typeof content !== "string") {
    return "Task content is required";
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return "Task content cannot be empty";
  }
  if (trimmed.length > 1000) {
    return "Task content cannot exceed 1000 characters";
  }
  return null;
}

export function validateDelegateName(name: string): string | null {
  if (!name || typeof name !== "string") {
    return "Delegate name is required";
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Delegate name cannot be empty";
  }
  if (trimmed.length > 100) {
    return "Delegate name cannot exceed 100 characters";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}
