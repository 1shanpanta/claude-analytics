#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { homedir } from "os";

const CLAUDE_DIR = path.join(homedir(), ".claude");
const OUTPUT = path.join(process.cwd(), "claude-analytics-export.json");

console.log("Claude Code Analytics — Data Export\n");

// 1. Stats cache
let stats = null;
try {
  stats = JSON.parse(fs.readFileSync(path.join(CLAUDE_DIR, "stats-cache.json"), "utf-8"));
  console.log("  stats-cache.json ✓");
} catch {
  console.log("  stats-cache.json ✗ (not found)");
}

// 2. Session metas
let sessions = [];
const metaDir = path.join(CLAUDE_DIR, "usage-data", "session-meta");
try {
  const files = fs.readdirSync(metaDir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(metaDir, f), "utf-8");
      const meta = JSON.parse(raw);
      if (meta.duration_minutes > 0) sessions.push(meta);
    } catch { /* skip */ }
  }
  sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  console.log(`  session-meta/ ✓ (${sessions.length} sessions)`);
} catch {
  console.log("  session-meta/ ✗ (not found)");
}

// 3. History
let history = [];
try {
  const raw = fs.readFileSync(path.join(CLAUDE_DIR, "history.jsonl"), "utf-8");
  history = raw.trim().split("\n").map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  console.log(`  history.jsonl ✓ (${history.length} entries)`);
} catch {
  console.log("  history.jsonl ✗ (not found)");
}

// 4. Account info
let account = {};
try {
  const statsigDir = path.join(CLAUDE_DIR, "statsig");
  const files = fs.readdirSync(statsigDir).filter((f) => f.includes("cached.evaluations"));
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(statsigDir, f), "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.user?.userID) account.accountUUID = parsed.user.userID;
      if (parsed.user?.custom?.organization_uuid) account.organizationUUID = parsed.user.custom.organization_uuid;
    } catch { /* skip */ }
  }
  if (account.accountUUID) {
    console.log(`  account info ✓ (${account.accountUUID.slice(0, 8)}...)`);
  } else {
    console.log("  account info ✗ (not found in statsig cache)");
  }
} catch {
  console.log("  account info ✗ (statsig dir not found)");
}

// 5. Project memories (with file content)
let memories = [];
try {
  const projectsDir = path.join(CLAUDE_DIR, "projects");
  const projects = fs.readdirSync(projectsDir);
  for (const p of projects) {
    const memDir = path.join(projectsDir, p, "memory");
    try {
      const mdFiles = fs.readdirSync(memDir).filter((f) => f.endsWith(".md"));
      if (mdFiles.length > 0) {
        const files = mdFiles.map((f) => ({
          name: f,
          content: fs.readFileSync(path.join(memDir, f), "utf-8").slice(0, 5000),
        }));
        memories.push({ project: p, files });
      }
    } catch { /* no memory dir */ }
  }
  if (memories.length > 0) {
    const totalFiles = memories.reduce((a, m) => a + m.files.length, 0);
    console.log(`  memories ✓ (${totalFiles} files across ${memories.length} projects)`);
  } else {
    console.log("  memories ✗ (none found)");
  }
} catch {
  console.log("  memories ✗ (projects dir not found)");
}

// Write output
const data = {
  stats,
  sessions,
  history,
  memories,
  account: Object.keys(account).length > 0 ? account : undefined,
  exportedAt: new Date().toISOString(),
};
fs.writeFileSync(OUTPUT, JSON.stringify(data));

const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
console.log(`\nExported to: ${OUTPUT} (${sizeMB} MB)`);
console.log("Upload this file at: https://claude-analytics.vercel.app");
