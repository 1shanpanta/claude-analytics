export interface SessionMeta {
  session_id: string;
  project_path: string;
  start_time: string;
  duration_minutes: number;
  user_message_count: number;
  assistant_message_count: number;
  tool_counts: Record<string, number>;
  languages: Record<string, number>;
  git_commits: number;
  git_pushes: number;
  input_tokens: number;
  output_tokens: number;
  first_prompt: string;
  user_interruptions: number;
  tool_errors: number;
  tool_error_categories: Record<string, number>;
  uses_task_agent: boolean;
  uses_mcp: boolean;
  uses_web_search: boolean;
  uses_web_fetch: boolean;
  lines_added: number;
  lines_removed: number;
  files_modified: number;
  message_hours: number[];
  user_message_timestamps: number[];
}

export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
}

export interface DailyActivity {
  date: string;
  messageCount: number;
  sessionCount: number;
  toolCallCount: number;
}

export interface DailyModelTokens {
  date: string;
  tokensByModel: Record<string, number>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD?: number;
  contextWindow?: number;
  maxOutputTokens?: number;
}

export interface StatsCache {
  totalSessions: number;
  totalMessages: number;
  firstSessionDate: string;
  dailyActivity: DailyActivity[];
  dailyModelTokens: DailyModelTokens[];
  modelUsage: Record<string, ModelUsage>;
  hourCounts: Record<string, number>;
  longestSession: {
    sessionId: string;
    duration: number;
    messageCount: number;
    timestamp: string;
  };
  version?: string;
  lastComputedDate?: string;
}

export interface SessionMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  toolUse?: { name: string; id: string }[];
}

export interface AccountInfo {
  accountUUID?: string;
  organizationUUID?: string;
  appVersion?: string;
}

export interface ProjectMemory {
  project: string;
  files: { name: string; content: string }[];
}

export interface DashboardData {
  stats: StatsCache | null;
  sessions: SessionMeta[];
  history: HistoryEntry[];
  memories: ProjectMemory[];
  account?: AccountInfo;
  exportedAt?: string;
}
