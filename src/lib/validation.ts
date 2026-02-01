
export function isValidTaskContent(content: string): boolean {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
}

export function isValidQuadrant(quadrant: string): boolean {
  const validQuadrants = ["INBOX", "DO", "SCHEDULE", "DELEGATE", "ELIMINATE"];
  return validQuadrants.includes(quadrant);
}

export function isValidStatus(status: string): boolean {
  const validStatuses = ["TODO", "DONE"];
  return validStatuses.includes(status);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}
