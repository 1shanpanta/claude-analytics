"use client";

import type { StatsCache, SessionMeta } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatCost } from "@/lib/utils";
import {
  MessageSquare,
  Clock,
  Zap,
  GitCommit,
  FileCode,
  Terminal,
  DollarSign,
  Info,
} from "lucide-react";

export function StatsOverview({
  stats,
  sessions,
  onNavigate,
}: {
  stats: StatsCache | null;
  sessions: SessionMeta[];
  onNavigate: (tab: string) => void;
}) {
  const totalMessages = stats?.totalMessages ?? 0;
  const totalSessions = stats?.totalSessions ?? sessions.length;
  const totalDuration = sessions.reduce((a, s) => a + s.duration_minutes, 0);
  const totalHours = Math.round(totalDuration / 60);
  const totalLinesAdded = sessions.reduce((a, s) => a + s.lines_added, 0);
  const totalLinesRemoved = sessions.reduce((a, s) => a + s.lines_removed, 0);
  const totalCommits = sessions.reduce((a, s) => a + s.git_commits, 0);
  const totalToolCalls = sessions.reduce(
    (a, s) => a + Object.values(s.tool_counts).reduce((b, c) => b + c, 0),
    0
  );
  const totalFilesModified = sessions.reduce(
    (a, s) => a + s.files_modified,
    0
  );

  const totalCost = stats
    ? Object.values(stats.modelUsage).reduce((a, u) => a + (u.costUSD ?? 0), 0)
    : 0;
  const modelCount = stats ? Object.keys(stats.modelUsage).length : 0;

  const cards = [
    {
      title: "Total Sessions",
      value: totalSessions.toLocaleString(),
      sub: `${totalHours}h total`,
      icon: Terminal,
      tab: "sessions",
    },
    {
      title: "Messages",
      value: totalMessages.toLocaleString(),
      sub: `${Math.round(totalMessages / Math.max(totalSessions, 1))}/session avg`,
      icon: MessageSquare,
      tab: "history",
    },
    {
      title: "Tool Calls",
      value: totalToolCalls.toLocaleString(),
      sub: `across all sessions`,
      icon: Zap,
      tab: "tools",
    },
    {
      title: "Lines Changed",
      value: `+${totalLinesAdded.toLocaleString()}`,
      sub: `-${totalLinesRemoved.toLocaleString()} removed`,
      icon: FileCode,
      tab: "sessions",
    },
    {
      title: "Files Modified",
      value: totalFilesModified.toLocaleString(),
      sub: `${totalCommits} commits`,
      icon: GitCommit,
      tab: "sessions",
    },
    {
      title: "Avg Session",
      value: `${Math.round(totalDuration / Math.max(sessions.length, 1))}m`,
      sub: `longest: ${stats?.longestSession ? formatDuration(stats.longestSession.duration) : "N/A"}`,
      icon: Clock,
      tab: "activity",
    },
    {
      title: "Total Cost",
      value: formatCost(totalCost),
      sub: `across ${modelCount} model${modelCount !== 1 ? "s" : ""}`,
      icon: DollarSign,
      tab: "models",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => onNavigate(card.tab)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-white">{card.value}</span>
              {card.title === "Total Cost" && totalCost === 0 && (
                <span className="group relative">
                  <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-md bg-gray-800 px-3 py-2 text-xs text-gray-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                    Cost data is unavailable for API-free usage (e.g. Max subscription or Pro plan). Only API usage reports cost.
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
