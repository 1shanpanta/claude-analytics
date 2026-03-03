"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/types";
import { Dashboard } from "./dashboard";
import { UploadZone } from "./upload-zone";

export function ClientPage({ initialData }: { initialData: DashboardData | null }) {
  const [data, setData] = useState<DashboardData | null>(initialData);

  if (!data) {
    return <UploadZone onDataLoaded={setData} />;
  }

  return (
    <div>
      <Dashboard data={data} />
      {/* Show reset button if data was uploaded (not from local) */}
      {!initialData && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setData(null)}
            className="rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            Upload different file
          </button>
        </div>
      )}
    </div>
  );
}
