export function validateTaskContent(content: string): string | null {
  if (!content || typeof content !== 'string') return "Content is required";
  if (content.trim().length === 0) return "Content cannot be empty";
  if (content.length > 1000) return "Content cannot exceed 1000 characters";
  return null;
}

export function validateDelegateName(name: string): string | null {
  if (!name || typeof name !== 'string') return "Name is required";
  if (name.trim().length === 0) return "Name cannot be empty";
  if (name.length > 100) return "Name cannot exceed 100 characters";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return null; // Optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
}

export function validateEstimatedMinutes(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined) return null;
  // If it's a string that parses to a number, we might want to allow it, but for strictness, let's assume the caller converts it.
  // However, Server Actions receiving FormData might have strings. But here we expect the action to pass typed data if it's from `client component` -> `server action`.
  // The actions defined in `task.ts` take `data: { estimatedMinutes?: number | null }`.
  if (typeof minutes !== 'number') return "Estimated minutes must be a number";
  if (minutes < 0) return "Estimated minutes cannot be negative";
  return null;
}
