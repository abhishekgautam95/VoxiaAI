"use client";

import React from "react";
import { Plus } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Appointments & Bookings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Appointments scheduled directly by your AI receptionist during phone conversations.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Connect Calendar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-400 font-medium">Booked Today</div>
          <div className="mt-2 text-2xl font-bold text-white">6</div>
          <div className="mt-1 text-xs text-emerald-400">100% calendar sync</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-400 font-medium">Upcoming This Week</div>
          <div className="mt-2 text-2xl font-bold text-white">28</div>
          <div className="mt-1 text-xs text-zinc-400">Across 3 providers</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-400 font-medium">Cancellation / Reschedules</div>
          <div className="mt-2 text-2xl font-bold text-white">2</div>
          <div className="mt-1 text-xs text-amber-400">Handled automatically</div>
        </div>
      </div>
    </div>
  );
}
