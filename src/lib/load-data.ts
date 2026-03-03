import fs from "fs";
import path from "path";

export type {
  SessionMeta,
  HistoryEntry,
  DailyActivity,
  DailyModelTokens,
  ModelUsage,
  StatsCache,
  DashboardData,
} from "./types";

import type { SessionMeta, HistoryEntry, StatsCache, DashboardData } from "./types";

const CLAUDE_DIR = path.join(process.env.HOME || "~", ".claude");

export function loadStatsCache(): StatsCache | null {
  try {
    const raw = fs.readFileSync(path.join(CLAUDE_DIR, "stats-cache.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadSessionMetas(): SessionMeta[] {
  const dir = path.join(CLAUDE_DIR, "usage-data", "session-meta");
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    return files
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(dir, f), "utf-8");
          return JSON.parse(raw) as SessionMeta;
        } catch {
          return null;
        }
      })
      .filter((s): s is SessionMeta => s !== null && s.duration_minutes > 0)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  } catch {
    return [];
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = fs.readFileSync(path.join(CLAUDE_DIR, "history.jsonl"), "utf-8");
    return raw
      .trim()
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line) as HistoryEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is HistoryEntry => e !== null);
  } catch {
    return [];
  }
}

export function loadProjectMemories(): { project: string; files: string[] }[] {
  const dir = path.join(CLAUDE_DIR, "projects");
  try {
    const projects = fs.readdirSync(dir);
    return projects.map((p) => {
      const memDir = path.join(dir, p, "memory");
      let files: string[] = [];
      try {
        files = fs.readdirSync(memDir).filter((f) => f.endsWith(".md"));
      } catch {
        /* no memory dir */
      }
      return { project: p, files };
    }).filter(p => p.files.length > 0);
  } catch {
    return [];
  }
}

export function loadAllData(): DashboardData {
  return {
    stats: loadStatsCache(),
    sessions: loadSessionMetas(),
    history: loadHistory(),
    memories: loadProjectMemories(),
  };
}
