"use client";

import type { StatsCache } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokens, formatCost } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#ffffff", "#d1d5db", "#9ca3af", "#6b7280", "#e5e7eb"];

function formatModelName(name: string): string {
  return name
    .replace("claude-", "")
    .replace(/-\d{8}$/, "")
    .replace(/-(\d+)-(\d+)$/, " $1.$2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ModelBreakdown({ stats }: { stats: StatsCache | null }) {
  if (!stats) return null;

  const pieData = Object.entries(stats.modelUsage).map(([model, usage]) => ({
    name: formatModelName(model),
    value: usage.outputTokens + usage.inputTokens,
  }));

  const barData = Object.entries(stats.modelUsage).map(([model, usage]) => ({
    name: formatModelName(model),
    input: usage.inputTokens,
    output: usage.outputTokens,
    cacheRead: usage.cacheReadInputTokens,
    cacheCreate: usage.cacheCreationInputTokens,
  }));

  const tokenTable = Object.entries(stats.modelUsage).map(([model, usage]) => ({
    name: formatModelName(model),
    input: usage.inputTokens,
    output: usage.outputTokens,
    cacheRead: usage.cacheReadInputTokens,
    cacheCreate: usage.cacheCreationInputTokens,
    cost: usage.costUSD ?? 0,
    webSearches: usage.webSearchRequests ?? 0,
  }));

  const hasWebSearches = tokenTable.some((r) => r.webSearches > 0);
  const totalCost = tokenTable.reduce((a, r) => a + r.cost, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                  formatter={(value) => [formatTokens(Number(value ?? 0)), "Tokens"]}
                />
                <Legend
                  wrapperStyle={{ color: "#d1d5db", fontSize: "12px" }}
                  formatter={(value) => <span style={{ color: "#d1d5db" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output Tokens by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#555555" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatTokens} stroke="#555555" />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                  formatter={(value) => [formatTokens(Number(value ?? 0))]}
                />
                <Bar dataKey="output" fill="#ffffff" name="Output" radius={[4, 4, 0, 0]} />
                <Bar dataKey="input" fill="#9ca3af" name="Input" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ color: "#d1d5db" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4">Model</th>
                  <th className="pb-3 pr-4 text-right">Input</th>
                  <th className="pb-3 pr-4 text-right">Output</th>
                  <th className="pb-3 pr-4 text-right">Cache Read</th>
                  <th className="pb-3 pr-4 text-right">Cache Create</th>
                  <th className="pb-3 pr-4 text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      Cost
                      {totalCost === 0 && (
                        <span className="group relative">
                          <Info className="h-3 w-3 text-gray-500 cursor-help" />
                          <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded-md bg-gray-800 px-3 py-2 text-xs font-normal text-gray-300 text-left opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                            Cost data is unavailable for API-free usage (e.g. Max subscription or Pro plan). Only API usage reports cost.
                          </span>
                        </span>
                      )}
                    </span>
                  </th>
                  {hasWebSearches && <th className="pb-3 text-right">Web Searches</th>}
                </tr>
              </thead>
              <tbody>
                {tokenTable.map((row) => (
                  <tr key={row.name} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs">{formatTokens(row.input)}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs">{formatTokens(row.output)}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs">{formatTokens(row.cacheRead)}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs">{formatTokens(row.cacheCreate)}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs">{formatCost(row.cost)}</td>
                    {hasWebSearches && <td className="py-3 text-right font-mono text-xs">{row.webSearches}</td>}
                  </tr>
                ))}
                <tr className="border-t font-medium">
                  <td className="pt-3 pr-4">Total</td>
                  <td className="pt-3 pr-4 text-right font-mono text-xs">{formatTokens(tokenTable.reduce((a, r) => a + r.input, 0))}</td>
                  <td className="pt-3 pr-4 text-right font-mono text-xs">{formatTokens(tokenTable.reduce((a, r) => a + r.output, 0))}</td>
                  <td className="pt-3 pr-4 text-right font-mono text-xs">{formatTokens(tokenTable.reduce((a, r) => a + r.cacheRead, 0))}</td>
                  <td className="pt-3 pr-4 text-right font-mono text-xs">{formatTokens(tokenTable.reduce((a, r) => a + r.cacheCreate, 0))}</td>
                  <td className="pt-3 pr-4 text-right font-mono text-xs">{formatCost(totalCost)}</td>
                  {hasWebSearches && <td className="pt-3 text-right font-mono text-xs">{tokenTable.reduce((a, r) => a + r.webSearches, 0)}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
