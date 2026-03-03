"use client";

import { useState, useCallback, useRef } from "react";
import type { DashboardData } from "@/lib/types";
import { Dashboard } from "./dashboard";
import { UploadZone } from "./upload-zone";

interface Profile {
  id: string;
  name: string;
  data: DashboardData;
}

function generateProfileName(data: DashboardData, index: number): string {
  if (data.account?.accountUUID) {
    return `Profile ${data.account.accountUUID.slice(0, 8)}`;
  }
  return `Profile ${index + 1}`;
}

export function ClientPage({ initialData }: { initialData: DashboardData | null }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (initialData) {
      return [{ id: "local", name: "Local", data: initialData }];
    }
    return [];
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    initialData ? "local" : null
  );
  const [addingProfile, setAddingProfile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const handleDataLoaded = useCallback(
    (data: DashboardData) => {
      const id = `upload-${Date.now()}`;
      const name = generateProfileName(data, profiles.length);
      setProfiles((prev) => [...prev, { id, name, data }]);
      setActiveProfileId(id);
      setAddingProfile(false);
    },
    [profiles.length]
  );

  const handleAddProfile = useCallback(() => {
    setAddingProfile(true);
  }, []);

  const handleSwitchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
  }, []);

  // No profiles at all — show upload zone
  if (profiles.length === 0) {
    return <UploadZone onDataLoaded={handleDataLoaded} />;
  }

  // Adding another profile — show upload overlay
  if (addingProfile) {
    return (
      <div className="relative">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/90">
          <div className="w-full max-w-2xl px-4">
            <UploadZone onDataLoaded={handleDataLoaded} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setAddingProfile(false)}
                className="rounded-lg bg-[#1a1a1a] border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeProfile) return null;

  return (
    <div>
      <Dashboard
        data={activeProfile.data}
        profiles={profiles}
        activeProfileId={activeProfileId!}
        onSwitchProfile={handleSwitchProfile}
        onAddProfile={handleAddProfile}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
      />
      {/* Reset button for uploaded profiles */}
      {!initialData && profiles.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              setProfiles([]);
              setActiveProfileId(null);
            }}
            className="rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
