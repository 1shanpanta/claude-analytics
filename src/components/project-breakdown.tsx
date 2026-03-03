"use client";

import type { SessionMeta } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ProjectBreakdown({ sessions }: { sessions: SessionMeta[] }) {
  const projectMap = new Map<string, { sessions: number; minutes: number; lines: number }>();

  for (const s of sessions) {
    const name = s.project_path.split("/").pop() || s.project_path;
    const existing = projectMap.get(name) ?? { sessions: 0, minutes: 0, lines: 0 };
    existing.sessions++;
    existing.minutes += s.duration_minutes;
    existing.lines += s.lines_added + s.lines_removed;
    projectMap.set(name, existing);
  }

  const data = Array.from(projectMap.entries())
    .map(([name, v]) => ({ name: name.length > 15 ? name.slice(0, 15) + ".." : name, ...v }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Projects (by time)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#555555" />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              width={120}
              stroke="#555555"
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
              formatter={(value) => [`${value}m`, "Time"]}
            />
            <Bar dataKey="minutes" fill="#d1d5db" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
