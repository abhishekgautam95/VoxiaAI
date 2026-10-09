"use client";

import React from "react";
import { PhoneCall, Filter, Download, Search } from "lucide-react";

export default function CallLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Call Logs & Transcripts</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Audit recordings, sentiment analysis, and conversational traces for all inbound calls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by caller, phone number, or transcript keyword..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-500" /> Filter by Status
          </button>
        </div>
      </div>

      {/* Empty State / Mock Logs List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 text-cyan-400">
          <PhoneCall className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-200">Continuous Realtime Streaming</h3>
        <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
          Inbound calls are automatically transcribed with sub-second diarization and stored with LLM-generated summaries.
        </p>
      </div>
    </div>
  );
}
