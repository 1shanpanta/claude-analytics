import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { SessionMessage } from "@/lib/types";

const CLAUDE_DIR = path.join(process.env.HOME || "~", ".claude");

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const projectPath = req.nextUrl.searchParams.get("project_path");

  if (!sessionId || !projectPath) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const encoded = projectPath.replace(/\//g, "-");
  const jsonlPath = path.join(CLAUDE_DIR, "projects", encoded, `${sessionId}.jsonl`);

  if (!fs.existsSync(jsonlPath)) {
    return NextResponse.json({ error: "Session file not found" }, { status: 404 });
  }

  try {
    const raw = fs.readFileSync(jsonlPath, "utf-8");
    const messages: SessionMessage[] = [];
    const seen = new Set<string>();

    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (!entry.message || !entry.message.role) continue;

        const msg = entry.message;
        const role = msg.role as "user" | "assistant";
        const ts = entry.timestamp || "";

        // Deduplicate by uuid (assistant messages can span multiple lines)
        const uuid = entry.uuid;
        if (uuid && seen.has(uuid)) continue;
        if (uuid) seen.add(uuid);

        let text = "";
        const toolUse: { name: string; id: string }[] = [];

        if (typeof msg.content === "string") {
          text = msg.content;
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === "text" && block.text) {
              text += block.text;
            } else if (block.type === "tool_use") {
              toolUse.push({ name: block.name, id: block.id });
            }
          }
        }

        // Skip empty messages and thinking-only blocks
        if (!text.trim() && toolUse.length === 0) continue;
        // Skip system-reminder only messages
        if (text.trim().startsWith("<system-reminder>") && !text.includes("</system-reminder>\n")) continue;

        messages.push({
          role,
          text: text.slice(0, 5000), // cap to prevent huge payloads
          timestamp: ts,
          toolUse: toolUse.length > 0 ? toolUse : undefined,
        });
      } catch {
        // skip malformed lines
      }
    }

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Failed to read session" }, { status: 500 });
  }
}
