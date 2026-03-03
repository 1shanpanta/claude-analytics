"use client";

import { useState } from "react";
import type { StatsCache } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getColor(count: number, max: number): string {
  if (count === 0) return "bg-[#1a1a1a]";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-white";
  if (ratio > 0.5) return "bg-gray-300";
  if (ratio > 0.25) return "bg-gray-500";
  return "bg-gray-700";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ActivityHeatmap({ stats }: { stats: StatsCache | null }) {
  const [hovered, setHovered] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  if (!stats) return null;

  const activity = stats.dailyActivity;
  const maxMessages = Math.max(...activity.map((d) => d.messageCount), 1);

  const dateMap = new Map(activity.map((d) => [d.date, d]));

  const startDate = new Date(activity[0]?.date ?? new Date());
  const endDate = new Date(activity[activity.length - 1]?.date ?? new Date());

  const days: { date: string; count: number; sessions: number }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const entry = dateMap.get(dateStr);
    days.push({
      date: dateStr,
      count: entry?.messageCount ?? 0,
      sessions: entry?.sessionCount ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  const weeks: { date: string; count: number; sessions: number }[][] = [];
  let currentWeek: { date: string; count: number; sessions: number }[] = [];

  const firstDay = new Date(days[0]?.date ?? new Date()).getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: "", count: -1, sessions: 0 });
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`h-3 w-3 rounded-sm transition-transform ${day.count < 0 ? "bg-transparent" : getColor(day.count, maxMessages)} ${day.count >= 0 ? "hover:scale-150 hover:ring-1 hover:ring-white/30 cursor-pointer" : ""}`}
                    onMouseEnter={(e) => {
                      if (day.count < 0) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parent = e.currentTarget.closest("[data-slot='card-content']")?.getBoundingClientRect();
                      if (parent) {
                        setHovered({
                          date: day.date,
                          count: day.count,
                          x: rect.left - parent.left + rect.width / 2,
                          y: rect.top - parent.top - 8,
                        });
                      }
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {hovered && (
            <div
              className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 shadow-lg"
              style={{ left: hovered.x, top: hovered.y }}
            >
              <p className="text-xs font-medium text-white whitespace-nowrap">
                {formatDate(hovered.date)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {hovered.count === 0
                  ? "No activity"
                  : `${hovered.count} message${hovered.count !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-[#1a1a1a]" />
          <div className="h-3 w-3 rounded-sm bg-gray-700" />
          <div className="h-3 w-3 rounded-sm bg-gray-500" />
          <div className="h-3 w-3 rounded-sm bg-gray-300" />
          <div className="h-3 w-3 rounded-sm bg-white" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
