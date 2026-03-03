"use client";

import type { StatsCache } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HourChart({ stats }: { stats: StatsCache | null }) {
  if (!stats) return null;

  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    sessions: Number(stats.hourCounts[String(i)] ?? 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions by Hour</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              interval={2}
              stroke="#555555"
            />
            <YAxis
              tick={{ fontSize: 11 }}
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
            <Bar dataKey="sessions" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
