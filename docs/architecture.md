# Architecture

## Overview

Claude Code Analytics is a Next.js 16 app that visualizes usage data from Claude Code's local `~/.claude/` directory. It runs in two modes:

1. **Local mode** — Server component reads `~/.claude/` directly via Node `fs` and passes data to the client.
2. **Upload mode** — User exports data with `scripts/export.mjs`, then uploads the JSON file. All processing happens client-side in the browser.

No data is ever sent to external servers. There is no database.

## Data Flow

```
~/.claude/ (local files)
    │
    ├── [Local mode] ──> page.tsx (server) ──> loadAllData() ──> ClientPage (client)
    │
    └── [Upload mode] ──> export.mjs ──> JSON file ──> UploadZone ──> ClientPage (client)
                                                                          │
                                                                          ▼
                                                                      Dashboard
                                                                          │
                                                    ┌───────────┬─────────┼──────────┬───────────┐
                                                    ▼           ▼         ▼          ▼           ▼
                                              StatsOverview  Activity  Sessions   Models    Prompts
                                              (7 cards)      Heatmap   Table     Breakdown  History
                                                             HourChart            DailyTokens
                                                             Projects             TokenTable
```

## Key Architecture Decisions

### Client-side only rendering
All components use `"use client"`. The server component (`page.tsx`) only reads files from disk — all chart rendering and interaction is client-side. This means the app works as a static export with uploaded files.

### Multi-profile state
`ClientPage` manages an array of `Profile` objects (each with an id, name, and full `DashboardData`). The active profile's data flows down to `Dashboard`. Profiles are additive — uploading a new file doesn't replace existing profiles.

### Project filtering
`Dashboard` extracts unique `project_path` values from sessions and renders a `Select` dropdown. When a project is selected, `sessions` and `history` arrays are filtered before passing to child components. Stats/heatmap/hour chart remain unfiltered because they use pre-aggregated data from `stats-cache.json` that can't be split by project.

### Neomorphic dark theme
The theme uses CSS custom properties in `globals.css` with `.dark` class selector. All shadcn components are styled via `[data-slot="..."]` selectors with dark neomorphic box-shadows. The `<html>` element has `className="dark"` set in `layout.tsx`.

## Directory Layout

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root HTML shell (fonts, dark class)
│   ├── page.tsx            # Server entry: loads data, renders ClientPage
│   ├── globals.css         # Tailwind + neomorphic theme
│   └── api/
│       └── session-messages/
│           └── route.ts    # GET endpoint for full session transcripts
├── components/
│   ├── client-page.tsx     # Profile management, upload/dashboard toggle
│   ├── dashboard.tsx       # Tab layout, project filter, profile switcher
│   ├── upload-zone.tsx     # File upload UI with instructions
│   ├── stats-overview.tsx  # 7 stat cards (sessions, messages, tools, lines, files, avg, cost)
│   ├── activity-heatmap.tsx
│   ├── hour-chart.tsx
│   ├── project-breakdown.tsx
│   ├── daily-tokens-chart.tsx  # Stacked area chart (tokens over time)
│   ├── model-breakdown.tsx     # Pie + bar + table with cost column
│   ├── session-table.tsx       # Expandable sessions with message viewer
│   ├── tool-usage-chart.tsx
│   ├── prompt-history.tsx
│   └── ui/                 # shadcn primitives (card, tabs, badge, select, etc.)
├── lib/
│   ├── types.ts            # All TypeScript interfaces
│   ├── utils.ts            # cn(), formatTokens(), formatDuration(), formatCost()
│   └── load-data.ts        # Server-side fs readers
scripts/
└── export.mjs              # CLI data export tool
```

## API Route

`GET /api/session-messages?session_id=X&project_path=Y`

Reads a session's full JSONL transcript from `~/.claude/projects/{encoded-project-path}/{session_id}.jsonl`. Returns an array of `SessionMessage` objects with deduplication by uuid. Only works in local mode (needs filesystem access).

## Dependencies

| Package | Purpose |
|---------|---------|
| next 16 | App Router framework |
| react 19 | UI library |
| recharts | Charts (Area, Bar, Pie) |
| radix-ui | Headless UI primitives (Tabs, Select, ScrollArea) |
| lucide-react | Icons |
| tailwindcss 4 | Utility CSS |
| clsx + tailwind-merge | Class name utilities |
| date-fns | Date formatting (heatmap) |
| class-variance-authority | Component variant styling |
