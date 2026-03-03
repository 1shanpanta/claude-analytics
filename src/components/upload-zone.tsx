"use client";

import { useState, useCallback, useRef } from "react";
import type { DashboardData } from "@/lib/types";
import { Upload, Terminal, FileJson, ArrowRight } from "lucide-react";

export function UploadZone({ onDataLoaded }: { onDataLoaded: (data: DashboardData) => void }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as DashboardData;

      if (!data.sessions && !data.stats) {
        setError("Invalid file format. Please use the export script to generate the data file.");
        return;
      }

      // Ensure arrays exist
      data.sessions = data.sessions || [];
      data.history = data.history || [];
      data.memories = data.memories || [];

      onDataLoaded(data);
    } catch {
      setError("Failed to parse file. Make sure it's a valid JSON export.");
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Claude Code Analytics
          </h1>
          <p className="mt-2 text-gray-500">
            Visualize your Claude Code sessions, prompts, and usage
          </p>
        </div>

        {/* Upload zone */}
        <div
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragging
              ? "border-white/40 bg-white/5"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-sm text-gray-400">Processing...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-4 text-lg font-medium text-gray-300">
                Drop your export file here
              </p>
              <p className="mt-1 text-sm text-gray-600">
                or click to browse
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-10 rounded-2xl bg-[#141414] border border-white/5 p-6">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Terminal className="h-4 w-4" />
            How to export your data
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400">1</span>
              <div>
                <p className="text-sm text-gray-400">Run the export script in your terminal:</p>
                <code className="mt-2 block rounded-lg bg-black/50 px-4 py-3 text-xs text-gray-300 font-mono">
                  npx claude-analytics-export
                </code>
                <p className="mt-1 text-xs text-gray-600">
                  Or clone the repo and run: <code className="text-gray-500">node scripts/export.mjs</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400">2</span>
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-400">
                  Upload the generated <code className="text-gray-300">claude-analytics-export.json</code> file above
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400">3</span>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-400">
                  Your data is processed entirely in the browser — nothing is sent to any server
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-700">
          All data stays in your browser. No data is stored or transmitted.
        </p>
      </div>
    </div>
  );
}
