"use client";

import type { StatsCache } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokens } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AREA_COLORS = ["#ffffff", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563"];

function formatModelName(name: string): string {
  return name
    .replace("claude-", "")
    .replace(/-\d{8}$/, "")
    .replace(/-(\d+)-(\d+)$/, " $1.$2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DailyTokensChart({ stats }: { stats: StatsCache | null }) {
  if (!stats?.dailyModelTokens?.length) return null;

  const models = new Set<string>();
  for (const day of stats.dailyModelTokens) {
    for (const model of Object.keys(day.tokensByModel)) {
      models.add(model);
    }
  }

  const modelList = Array.from(models);

  const chartData = stats.dailyModelTokens.map((day) => {
    const entry: Record<string, string | number> = {
      date: day.date.slice(5),
    };
    for (const model of modelList) {
      entry[model] = day.tokensByModel[model] ?? 0;
    }
    return entry;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#555555" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatTokens} stroke="#555555" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
              formatter={(value, name) => [
                formatTokens(Number(value ?? 0)),
                formatModelName(String(name)),
              ]}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Legend
              wrapperStyle={{ color: "#d1d5db" }}
              formatter={(value) => formatModelName(value)}
            />
            {modelList.map((model, i) => (
              <Area
                key={model}
                type="monotone"
                dataKey={model}
                stackId="1"
                stroke={AREA_COLORS[i % AREA_COLORS.length]}
                fill={AREA_COLORS[i % AREA_COLORS.length]}
                fillOpacity={0.3}
                name={model}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
