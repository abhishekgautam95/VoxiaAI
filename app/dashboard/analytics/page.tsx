"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics & ROI</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inbound volume, call deflection rates, and receptionist staff cost savings.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-cyan-400" />
        <h3 className="mt-3 text-sm font-semibold text-zinc-200">ROI Analytics Dashboard</h3>
        <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
          Over 4,200 voice minutes handled this month saving an estimated 70 hours of front desk staff time.
        </p>
      </div>
    </div>
  );
}
