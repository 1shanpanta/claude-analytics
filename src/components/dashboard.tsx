"use client";

import { useState, useMemo } from "react";
import type { DashboardData } from "@/lib/types";
import { StatsOverview } from "./stats-overview";
import { ActivityHeatmap } from "./activity-heatmap";
import { SessionTable } from "./session-table";
import { ModelBreakdown } from "./model-breakdown";
import { ProjectBreakdown } from "./project-breakdown";
import { ToolUsageChart } from "./tool-usage-chart";
import { HourChart } from "./hour-chart";
import { PromptHistory } from "./prompt-history";
import { DailyTokensChart } from "./daily-tokens-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  name: string;
  data: DashboardData;
}

export function Dashboard({
  data,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onAddProfile,
}: {
  data: DashboardData;
  profiles?: Profile[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onAddProfile?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("activity");
  const [selectedProject, setSelectedProject] = useState("all");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of data.sessions) {
      if (s.project_path && !map.has(s.project_path)) {
        const segments = s.project_path.replace(/\/$/, "").split("/");
        map.set(s.project_path, segments[segments.length - 1] || s.project_path);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [data.sessions]);

  const filteredSessions = useMemo(
    () =>
      selectedProject === "all"
        ? data.sessions
        : data.sessions.filter((s) => s.project_path === selectedProject),
    [data.sessions, selectedProject]
  );

  const filteredHistory = useMemo(
    () =>
      selectedProject === "all"
        ? data.history
        : data.history.filter((h) => h.project === selectedProject),
    [data.history, selectedProject]
  );

  const firstDate = data.stats?.firstSessionDate
    ? new Date(data.stats.firstSessionDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const showProfileSwitcher = profiles && profiles.length > 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Claude Code Analytics
            </h1>
            <p className="mt-1 text-gray-400">
              Your personal coding session insights
            </p>
            {firstDate && (
              <p className="mt-1 text-sm text-gray-600">
                Using Claude Code since {firstDate}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showProfileSwitcher && (
              <Select value={activeProfileId} onValueChange={onSwitchProfile}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onAddProfile && profiles && profiles.length > 0 && (
              <button
                onClick={onAddProfile}
                className="rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
              >
                + Profile
              </button>
            )}
          </div>
        </div>

        <StatsOverview stats={data.stats} sessions={data.sessions} onNavigate={setActiveTab} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5 p-1">
            <TabsTrigger value="activity" className="h-full">Activity</TabsTrigger>
            <TabsTrigger value="sessions" className="h-full">Sessions</TabsTrigger>
            <TabsTrigger value="models" className="h-full">Models</TabsTrigger>
            <TabsTrigger value="tools" className="h-full">Tools</TabsTrigger>
            <TabsTrigger value="history" className="h-full">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6 space-y-6">
            <ActivityHeatmap stats={data.stats} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <HourChart stats={data.stats} />
              <ProjectBreakdown sessions={data.sessions} />
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionTable sessions={filteredSessions} />
          </TabsContent>

          <TabsContent value="models" className="mt-6 space-y-6">
            <DailyTokensChart stats={data.stats} />
            <ModelBreakdown stats={data.stats} />
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <ToolUsageChart sessions={filteredSessions} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <PromptHistory history={filteredHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
