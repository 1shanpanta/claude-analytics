# Components Reference

All components are client-side (`"use client"`). They live in `src/components/`.

## Page-Level Components

### `ClientPage`
**File:** `src/components/client-page.tsx`
**Props:** `{ initialData: DashboardData | null }`

Root client component. Manages multi-profile state:
- `profiles: Profile[]` — array of `{ id, name, data }` objects
- `activeProfileId: string | null` — currently viewed profile
- `addingProfile: boolean` — overlay for uploading another file

When no profiles exist, shows `UploadZone`. When `addingProfile` is true, shows upload overlay on top of dashboard.

### `Dashboard`
**File:** `src/components/dashboard.tsx`
**Props:**
```ts
{
  data: DashboardData;
  profiles?: Profile[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onAddProfile?: () => void;
}
```

Main layout with header, stats cards, and tabbed content. Contains:
- Project filter dropdown (filters sessions/history by `project_path`)
- Profile switcher (only shown when >1 profile)
- 5 tabs: Activity, Sessions, Models, Tools, Prompts
- "Using Claude Code since..." date from `stats.firstSessionDate`

### `UploadZone`
**File:** `src/components/upload-zone.tsx`
**Props:** `{ onDataLoaded: (data: DashboardData) => void }`

Drag-and-drop or click-to-upload interface. Validates JSON structure, normalizes old memory format (string arrays to `{name, content}` objects). Shows export instructions.

## Data Visualization Components

### `StatsOverview`
**File:** `src/components/stats-overview.tsx`
**Props:** `{ stats: StatsCache | null; sessions: SessionMeta[]; onNavigate: (tab: string) => void }`

7 clickable stat cards in a responsive grid:
1. Total Sessions (with total hours)
2. Messages (with per-session average)
3. Tool Calls
4. Lines Changed (+added / -removed)
5. Files Modified (with commit count)
6. Avg Session (with longest session using `formatDuration`)
7. Total Cost (across N models)

Clicking a card navigates to the relevant tab.

### `ActivityHeatmap`
**File:** `src/components/activity-heatmap.tsx`
**Props:** `{ stats: StatsCache | null }`

GitHub-style contribution heatmap using `stats.dailyActivity`. Shows last year of data. Hover tooltips show date and message count. Color gradient from dark to white based on message intensity.

### `HourChart`
**File:** `src/components/hour-chart.tsx`
**Props:** `{ stats: StatsCache | null }`

Recharts `BarChart` showing session count by hour of day (0-23). Uses `stats.hourCounts`.

### `ProjectBreakdown`
**File:** `src/components/project-breakdown.tsx`
**Props:** `{ sessions: SessionMeta[] }`

Horizontal bar chart showing top 10 projects ranked by total time spent. Extracts last path segment as display name.

### `DailyTokensChart`
**File:** `src/components/daily-tokens-chart.tsx`
**Props:** `{ stats: StatsCache | null }`

Recharts stacked `AreaChart` using `stats.dailyModelTokens`. One area per model, stacked. Shows token consumption trends over time.

### `ModelBreakdown`
**File:** `src/components/model-breakdown.tsx`
**Props:** `{ stats: StatsCache | null }`

Three sections:
1. **Pie chart** — model usage distribution (input + output tokens)
2. **Bar chart** — output vs input tokens by model
3. **Token table** — columns: Model, Input, Output, Cache Read, Cache Create, Cost, Web Searches (conditional). Includes total summary row.

### `SessionTable`
**File:** `src/components/session-table.tsx`
**Props:** `{ sessions: SessionMeta[] }`

Searchable, expandable session list. Each session shows: duration, messages, lines changed, commits, files, languages, tools used, web search/MCP/agent badges. Expanding a session fetches full conversation from `/api/session-messages` and renders message bubbles.

### `ToolUsageChart`
**File:** `src/components/tool-usage-chart.tsx`
**Props:** `{ sessions: SessionMeta[] }`

Two horizontal bar charts side by side:
1. Top 15 tools by usage count
2. Top 10 languages by line count

Aggregates `tool_counts` and `languages` across all sessions.

### `PromptHistory`
**File:** `src/components/prompt-history.tsx`
**Props:** `{ history: HistoryEntry[] }`

Searchable list of prompts (limited to first 200). Each entry shows timestamp, character count, project name. Expandable to show full prompt text. Copy-to-clipboard button.

## UI Primitives (shadcn)

Located in `src/components/ui/`:

| Component | File | Usage |
|-----------|------|-------|
| Card | `card.tsx` | Stat cards, chart wrappers |
| Tabs | `tabs.tsx` | Main navigation tabs |
| Badge | `badge.tsx` | Session detail tags |
| ScrollArea | `scroll-area.tsx` | Scrollable content areas |
| Separator | `separator.tsx` | Visual dividers |
| Select | `select.tsx` | Project filter, profile switcher |

All styled via `[data-slot="..."]` selectors in `globals.css` with neomorphic dark theme.

## Shared Utilities

**File:** `src/lib/utils.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `cn` | `(...inputs: ClassValue[]) => string` | Merges Tailwind classes (clsx + tailwind-merge) |
| `formatTokens` | `(n: number) => string` | 1600000 → "1.6M", 52300 → "52.3K" |
| `formatDuration` | `(ms: number) => string` | <60m → "42m", <48h → "12h", else → "10d" |
| `formatCost` | `(usd: number) => string` | 12.34 → "$12.34" |
