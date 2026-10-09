"use client";

import React from "react";
import { Phone, Plus, CheckCircle2 } from "lucide-react";

export default function PhoneNumbersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Phone Numbers</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Provision and configure dedicated toll-free and local numbers assigned to your AI receptionist.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Provision New Number
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-sm">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-200">+1 (415) 800-4291</p>
              <p className="text-xs text-zinc-400">San Francisco, CA • Assigned to Sarah</p>
            </div>
          </div>
          <span className="rounded bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Routing Live
          </span>
        </div>
      </div>
    </div>
  );
}
