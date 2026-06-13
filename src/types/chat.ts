// ─── LLM Provider ────────────────────────────────────────────────────────────

export type LLMProvider = "gemini" | "openai" | "claude";

export interface LLMProviderMeta {
  id: LLMProvider;
  label: string;
  available: boolean;
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// ─── Task Proposal ────────────────────────────────────────────────────────────

export type QuadrantKey =
  | "DO_FIRST"
  | "SCHEDULE"
  | "DELEGATE"
  | "ELIMINATE"
  | "INBOX";

export interface ProposedTask {
  content: string;
  isImportant: boolean;
  isUrgent: boolean;
  quadrant: QuadrantKey;
  /** ISO date string "YYYY-MM-DD" or null */
  dueDate: string | null;
  /** "Self" or a person's name */
  delegateName: string;
  estimatedMinutes: number;
  /** true = automatically generated follow-up for a delegated task */
  isFollowUp: boolean;
  /** title of the task this is a follow-up for */
  parentTask?: string;
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

/** Sent by client → POST /api/chat */
export interface ChatAPIRequest {
  messages: ChatMessage[];
  provider?: LLMProvider;
  /** "home" = need to pick workspace; "matrix" = workspace already known */
  context: "home" | "matrix";
  workspaceId?: number;
  botName?: string;
  language?: "english" | "hinglish";
}

/**
 * JSON structure the LLM returns (parsed from SSE stream end event).
 * mode "task"   → proposedTasks is populated
 * mode "answer" → reply contains the conversational response
 */
export interface LLMStructuredResponse {
  mode: "task" | "answer";
  reply: string;
  confused: boolean;
  clarificationQuestion?: string;
  proposedTasks: ProposedTask[];
  /** Workspace the LLM resolved to (only set on mode "task" from home) */
  resolvedWorkspaceId?: number | null;
}

/** SSE stream chunk shape written to the stream */
export interface StreamChunk {
  type: "token" | "done" | "error" | "quota_exceeded" | "rate_limited";
  token?: string;
  result?: LLMStructuredResponse;
  error?: string;
  used?: number;
  limit?: number;
}

// ─── Quota ────────────────────────────────────────────────────────────────────

export interface QuotaStatus {
  used: number;
  limit: number;
  period: "DAY" | "WEEK";
  exhausted: boolean;
}
