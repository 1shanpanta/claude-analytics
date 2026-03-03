"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/types";
import { StatsOverview } from "./stats-overview";
import { ActivityHeatmap } from "./activity-heatmap";
import { SessionTable } from "./session-table";
import { ModelBreakdown } from "./model-breakdown";
import { ProjectBreakdown } from "./project-breakdown";
import { ToolUsageChart } from "./tool-usage-chart";
import { HourChart } from "./hour-chart";
import { PromptHistory } from "./prompt-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Dashboard({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Claude Code Analytics
          </h1>
          <p className="mt-1 text-gray-400">
            Your personal coding session insights
          </p>
        </div>

        <StatsOverview stats={data.stats} sessions={data.sessions} onNavigate={setActiveTab} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="history">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6 space-y-6">
            <ActivityHeatmap stats={data.stats} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <HourChart stats={data.stats} />
              <ProjectBreakdown sessions={data.sessions} />
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionTable sessions={data.sessions} />
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <ModelBreakdown stats={data.stats} />
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <ToolUsageChart sessions={data.sessions} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <PromptHistory history={data.history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
