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
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <p className="text-xs text-gray-500">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
