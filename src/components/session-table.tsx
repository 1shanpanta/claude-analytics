"use client";

import { useState, useCallback } from "react";
import type { SessionMeta, SessionMessage } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, User, Bot, Wrench, Loader2 } from "lucide-react";

export function SessionTable({ sessions }: { sessions: SessionMeta[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, SessionMessage[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async (session: SessionMeta) => {
    if (messages[session.session_id]) return;
    setLoading(session.session_id);
    try {
      const params = new URLSearchParams({
        session_id: session.session_id,
        project_path: session.project_path,
      });
      const res = await fetch(`/api/session-messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => ({ ...prev, [session.session_id]: data.messages }));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }, [messages]);

  const handleToggle = (session: SessionMeta) => {
    if (expandedId === session.session_id) {
      setExpandedId(null);
    } else {
      setExpandedId(session.session_id);
      fetchMessages(session);
    }
  };

  const filtered = sessions.filter(
    (s) =>
      s.first_prompt.toLowerCase().includes(search.toLowerCase()) ||
      s.project_path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <input
          type="text"
          placeholder="Search by prompt or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {filtered.map((s) => {
              const isExpanded = expandedId === s.session_id;
              const sessionMessages = messages[s.session_id];
              const isLoading = loading === s.session_id;

              return (
                <div
                  key={s.session_id}
                  className="rounded-lg border p-4 transition-all"
                >
                  <div
                    className="cursor-pointer hover:bg-white/5 -m-4 p-4 rounded-lg"
                    onClick={() => handleToggle(s)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="mt-0.5 text-gray-500">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium text-gray-200 ${isExpanded ? "" : "truncate"}`}>
                            {s.first_prompt === "No prompt"
                              ? "(empty session)"
                              : s.first_prompt}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {s.project_path.split("/").slice(-2).join("/")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500">
                          {new Date(s.start_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs font-medium text-gray-300">
                          {s.duration_minutes}m
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">
                        {s.user_message_count + s.assistant_message_count} msgs
                      </Badge>
                      {s.lines_added > 0 && (
                        <Badge variant="secondary" className="!text-emerald-400">
                          +{s.lines_added}
                        </Badge>
                      )}
                      {s.lines_removed > 0 && (
                        <Badge variant="secondary" className="!text-red-400">
                          -{s.lines_removed}
                        </Badge>
                      )}
                      {s.git_commits > 0 && (
                        <Badge variant="secondary">
                          {s.git_commits} commit{s.git_commits > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {s.files_modified > 0 && (
                        <Badge variant="secondary">
                          {s.files_modified} files
                        </Badge>
                      )}
                      {Object.entries(s.languages).map(([lang, count]) => (
                        <Badge key={lang} variant="outline">
                          {lang}: {count}
                        </Badge>
                      ))}
                      {s.tool_errors > 0 && (
                        <Badge variant="destructive">
                          {s.tool_errors} error{s.tool_errors > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {s.uses_web_search && <Badge variant="outline">web search</Badge>}
                      {s.uses_mcp && <Badge variant="outline">MCP</Badge>}
                      {s.uses_task_agent && <Badge variant="outline">agents</Badge>}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      {/* Session stats */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">User messages</span>
                          <span className="text-gray-300">{s.user_message_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Assistant messages</span>
                          <span className="text-gray-300">{s.assistant_message_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Input tokens</span>
                          <span className="text-gray-300">{s.input_tokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Output tokens</span>
                          <span className="text-gray-300">{s.output_tokens.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Message thread */}
                      <div className="space-y-0">
                        <h4 className="text-xs font-medium text-gray-400 mb-3">Conversation</h4>
                        {isLoading && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs py-4">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading messages...
                          </div>
                        )}
                        {sessionMessages && (
                          <div className="space-y-1">
                            {sessionMessages.map((msg, i) => (
                              <MessageBubble key={i} message={msg} />
                            ))}
                          </div>
                        )}
                        {!isLoading && !sessionMessages && (
                          <p className="text-xs text-gray-600">Session file not found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: SessionMessage }) {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.role === "user";
  const isLong = message.text.length > 300;
  const displayText = expanded ? message.text : message.text.slice(0, 300);

  return (
    <div
      className={`flex gap-2 py-2 ${isUser ? "" : ""}`}
      onClick={() => isLong && setExpanded(!expanded)}
    >
      <div className={`mt-0.5 shrink-0 rounded-full p-1 ${isUser ? "bg-white/10" : "bg-white/5"}`}>
        {isUser ? (
          <User className="h-3 w-3 text-gray-400" />
        ) : (
          <Bot className="h-3 w-3 text-gray-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-medium ${isUser ? "text-gray-300" : "text-gray-500"}`}>
            {isUser ? "You" : "Claude"}
          </span>
          {message.timestamp && (
            <span className="text-[10px] text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${isUser ? "text-gray-200" : "text-gray-400"} ${isLong && !expanded ? "cursor-pointer" : ""}`}>
          {displayText}
          {isLong && !expanded && (
            <span className="text-gray-600"> ...click to expand</span>
          )}
        </p>
        {message.toolUse && message.toolUse.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.toolUse.map((tool) => (
              <span
                key={tool.id}
                className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500"
              >
                <Wrench className="h-2.5 w-2.5" />
                {tool.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
