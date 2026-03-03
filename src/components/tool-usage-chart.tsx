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

export function ToolUsageChart({ sessions }: { sessions: SessionMeta[] }) {
  const toolMap = new Map<string, number>();

  for (const s of sessions) {
    for (const [tool, count] of Object.entries(s.tool_counts)) {
      toolMap.set(tool, (toolMap.get(tool) ?? 0) + count);
    }
  }

  const data = Array.from(toolMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const langMap = new Map<string, number>();
  for (const s of sessions) {
    for (const [lang, count] of Object.entries(s.languages)) {
      langMap.set(lang, (langMap.get(lang) ?? 0) + count);
    }
  }

  const langData = Array.from(langMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage (all sessions)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#555555" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
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
              />
              <Bar dataKey="count" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Languages Used</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={langData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#555555" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
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
              />
              <Bar dataKey="count" fill="#d1d5db" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
