"use client";

import { useState } from "react";
import type { HistoryEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

export function PromptHistory({ history }: { history: HistoryEntry[] }) {
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filtered = history
    .filter(
      (h) =>
        h.display &&
        h.display.trim().length > 0 &&
        !h.display.startsWith("/login") &&
        h.display.toLowerCase().includes(search.toLowerCase())
    )
    .reverse();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt History ({filtered.length} prompts)</CardTitle>
        <input
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {filtered.slice(0, 200).map((h, i) => {
              const isExpanded = expandedIndex === i;
              const isLong = h.display.length > 120;

              return (
                <div
                  key={i}
                  className="group cursor-pointer rounded-lg border p-3 transition-all hover:bg-white/5"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-gray-500">
                      {isLong ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm text-gray-200 ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                        {isExpanded ? h.display : h.display.slice(0, 200)}
                        {!isExpanded && h.display.length > 200 ? "..." : ""}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(h.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {h.project?.split("/").pop() || "unknown"}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {h.display.length} chars
                        </span>
                      </div>
                    </div>
                    <button
                      className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(h.display, i);
                      }}
                      title="Copy prompt"
                    >
                      {copiedIndex === i ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
