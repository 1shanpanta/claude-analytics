# Claude Code Analytics

A personal analytics dashboard for [Claude Code](https://claude.ai/claude-code) sessions. Visualize your coding patterns, model usage, tool calls, and prompt history — all from the data Claude Code stores locally on your machine.

**Your data never leaves your browser.** The hosted version processes everything client-side.

## Features

- **Activity Heatmap** — GitHub-style contribution grid showing daily message activity
- **Session Explorer** — Browse all sessions with expandable message threads (every user/assistant message)
- **Model Breakdown** — Pie chart + bar chart + token table across all models used
- **Tool Usage** — See which tools (Read, Edit, Bash, etc.) you use most
- **Prompt History** — Searchable, clickable prompt log with copy-to-clipboard
- **Stats Overview** — Clickable cards for total sessions, messages, tool calls, lines changed, files modified, avg session length
- **Sessions by Hour** — Bar chart of when you code most
- **Top Projects** — Ranked by time spent

## Screenshots

Dark neomorphic theme with white-ish charts on black background.

## Quick Start

### Local (reads your data directly)

```bash
git clone https://github.com/1shanpanta/claude-analytics.git
cd claude-analytics
bun install
bun dev
```

Opens at `http://localhost:3000` and auto-loads your `~/.claude/` data.

### Hosted (upload mode)

1. Export your data:

```bash
# clone the repo and run the export script
node scripts/export.mjs
```

2. Visit the hosted app and drop the generated `claude-analytics-export.json` file.

All processing happens in your browser. Nothing is uploaded to any server.

## How It Works

Claude Code stores session metadata, usage stats, and prompt history locally in `~/.claude/`:

| File | What it contains |
|------|-----------------|
| `~/.claude/stats-cache.json` | Aggregated stats, model usage, daily activity |
| `~/.claude/usage-data/session-meta/*.json` | Per-session metadata (duration, tools, lines, commits) |
| `~/.claude/history.jsonl` | Every prompt you've sent |
| `~/.claude/projects/<id>/<session>.jsonl` | Full conversation messages (local mode only) |

The dashboard reads these files and renders charts + tables. No external APIs, no telemetry.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **shadcn/ui** (Card, Tabs, Badge, ScrollArea)
- **Recharts** (Bar, Pie charts)
- **Lucide Icons**
- **bun** (package manager + runtime)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Server component, auto-detects local data
│   ├── globals.css           # Dark neomorphic theme
│   └── api/session-messages/ # API route for loading full conversation threads
├── components/
│   ├── client-page.tsx       # Client wrapper (upload vs dashboard)
│   ├── upload-zone.tsx       # Drag-and-drop file upload landing
│   ├── dashboard.tsx         # Main layout with tabs
│   ├── stats-overview.tsx    # 6 clickable stat cards
│   ├── activity-heatmap.tsx  # GitHub-style heatmap with hover tooltips
│   ├── hour-chart.tsx        # Sessions by hour bar chart
│   ├── project-breakdown.tsx # Top projects horizontal bar chart
│   ├── session-table.tsx     # Expandable session list with message viewer
│   ├── model-breakdown.tsx   # Pie + bar + table for model tokens
│   ├── tool-usage-chart.tsx  # Tool usage + languages bar charts
│   └── prompt-history.tsx    # Searchable prompt log with copy
├── lib/
│   ├── types.ts              # Shared TypeScript interfaces
│   └── load-data.ts          # Server-side data loader (fs)
scripts/
└── export.mjs                # CLI export script for bundling data
```

## License

MIT
