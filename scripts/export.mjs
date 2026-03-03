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

// Write output
const data = { stats, sessions, history, memories: [] };
fs.writeFileSync(OUTPUT, JSON.stringify(data));

const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
console.log(`\nExported to: ${OUTPUT} (${sizeMB} MB)`);
console.log("Upload this file at: https://claude-analytics.vercel.app");
