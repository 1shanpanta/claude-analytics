# Data Model

All TypeScript interfaces are defined in `src/lib/types.ts`.

## Core Types

### `DashboardData`
Root data structure passed from server/upload to the dashboard.

```ts
interface DashboardData {
  stats: StatsCache | null;        // Aggregated statistics
  sessions: SessionMeta[];          // Per-session metadata
  history: HistoryEntry[];          // Prompt history
  memories: ProjectMemory[];        // Project memory files with content
  account?: AccountInfo;            // Account identifiers (from export)
  exportedAt?: string;              // ISO timestamp of export
}
```

### `StatsCache`
Pre-aggregated statistics from `~/.claude/stats-cache.json`. This is computed by Claude Code itself and contains data that can't be derived from session metas alone.

```ts
interface StatsCache {
  totalSessions: number;
  totalMessages: number;
  firstSessionDate: string;                    // ISO date string
  dailyActivity: DailyActivity[];              // Daily message/session/tool counts
  dailyModelTokens: DailyModelTokens[];        // Daily token usage by model
  modelUsage: Record<string, ModelUsage>;       // Per-model token breakdown
  hourCounts: Record<string, number>;           // Sessions per hour (0-23)
  longestSession: {
    sessionId: string;
    duration: number;      // milliseconds
    messageCount: number;
    timestamp: string;
  };
  version?: string;
  lastComputedDate?: string;
}
```

### `SessionMeta`
Per-session metadata from `~/.claude/usage-data/session-meta/*.json`.

```ts
interface SessionMeta {
  session_id: string;
  project_path: string;                        // Absolute path to project directory
  start_time: string;                          // ISO timestamp
  duration_minutes: number;
  user_message_count: number;
  assistant_message_count: number;
  tool_counts: Record<string, number>;         // e.g. {"Read": 42, "Edit": 15}
  languages: Record<string, number>;           // e.g. {"TypeScript": 200, "CSS": 50}
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
  message_hours: number[];                     // Hours when messages were sent
  user_message_timestamps: number[];           // Unix timestamps of user messages
}
```

### `ModelUsage`
Token breakdown for a single model.

```ts
interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD?: number;                // Total cost in USD for this model
  contextWindow?: number;          // Model's context window size
  maxOutputTokens?: number;        // Model's max output token limit
}
```

### `HistoryEntry`
Single prompt from `~/.claude/history.jsonl`.

```ts
interface HistoryEntry {
  display: string;                             // The prompt text
  pastedContents: Record<string, unknown>;     // Any pasted content
  timestamp: number;                           // Unix timestamp (ms)
  project: string;                             // Project path
}
```

### `ProjectMemory`
Memory files from `~/.claude/projects/<id>/memory/`.

```ts
interface ProjectMemory {
  project: string;                             // Encoded project directory name
  files: { name: string; content: string }[];  // .md files with content (max 5000 chars)
}
```

### `AccountInfo`
Account identifiers extracted from statsig cache during export.

```ts
interface AccountInfo {
  accountUUID?: string;
  organizationUUID?: string;
  appVersion?: string;
}
```

### `SessionMessage`
Individual message from a session transcript (loaded via API route).

```ts
interface SessionMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  toolUse?: { name: string; id: string }[];
}
```

## Export JSON Format

The `scripts/export.mjs` script produces a single JSON file with this structure:

```json
{
  "stats": { ... },           // StatsCache object
  "sessions": [ ... ],        // SessionMeta[] sorted by start_time desc
  "history": [ ... ],         // HistoryEntry[] from history.jsonl
  "memories": [               // ProjectMemory[] with file contents
    {
      "project": "-Users-ishan-project",
      "files": [
        { "name": "MEMORY.md", "content": "..." }
      ]
    }
  ],
  "account": {                // AccountInfo (optional)
    "accountUUID": "...",
    "organizationUUID": "..."
  },
  "exportedAt": "2026-03-03T12:00:00.000Z"
}
```

## Source Files on Disk

| Path | Format | Read by |
|------|--------|---------|
| `~/.claude/stats-cache.json` | JSON | `loadStatsCache()`, `export.mjs` |
| `~/.claude/usage-data/session-meta/*.json` | JSON per file | `loadSessionMetas()`, `export.mjs` |
| `~/.claude/history.jsonl` | Newline-delimited JSON | `loadHistory()`, `export.mjs` |
| `~/.claude/projects/<id>/memory/*.md` | Markdown | `loadProjectMemories()`, `export.mjs` |
| `~/.claude/projects/<id>/<session>.jsonl` | Newline-delimited JSON | `/api/session-messages` route |
| `~/.claude/statsig/statsig.cached.evaluations.*` | JSON | `export.mjs` (account info) |

## Backward Compatibility

The upload zone (`upload-zone.tsx`) handles old export formats:
- If `memories[].files` contains plain strings instead of `{name, content}` objects, it normalizes them automatically.
- Missing `account` and `exportedAt` fields are simply undefined (all components handle this gracefully).
