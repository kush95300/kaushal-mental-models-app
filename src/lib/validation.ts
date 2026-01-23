export function validateTaskContent(content: unknown): string | null {
  if (!content || typeof content !== "string" || !content.trim()) {
    return "Task content is required.";
  }
  if (content.length > 1000) {
    return "Task content cannot exceed 1000 characters.";
  }
  return null;
}

export function validateDelegateName(name: unknown): string | null {
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Delegate name is required.";
  }
  if (name.length > 100) {
    return "Delegate name cannot exceed 100 characters.";
  }
  return null;
}

export function validateEmail(email: unknown): string | null {
  if (!email) return null; // Email is optional
  if (typeof email !== "string") return "Invalid email format.";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address.";
  }
  return null;
}
