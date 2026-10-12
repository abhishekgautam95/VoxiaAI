"use client";

import React from "react";
import {
  DollarSign,
  Users,
  Bot,
} from "lucide-react";

export function RoiCalculatorCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Financial ROI & Cost Comparison
            </h3>
            <p className="text-xs text-zinc-400">
              Direct monthly cost comparison between a traditional full-time receptionist and VoxiaAI.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            1,385% ROI Realized
          </span>
        </div>
      </div>

      {/* Side-by-Side Cost Comparison */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Human Staff Column */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Users className="h-4 w-4 text-zinc-400" />
              <span>Full-Time Human Receptionist</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">160 hrs / mo</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-300">$5,200</span>
            <span className="text-xs text-zinc-500">/ month</span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center justify-between text-[11px]">
              <span>Base Hourly Wage ($30/hr)</span>
              <span className="text-zinc-300">$4,800/mo</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Payroll Taxes, Healthcare & Benefits</span>
              <span className="text-zinc-300">$400/mo</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Coverage Availability</span>
              <span className="text-zinc-400">40 hrs / week (8h/day)</span>
            </div>
          </div>
        </div>

        {/* VoxiaAI Autonomous Voice Agent Column */}
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950 p-4 space-y-3 ring-1 ring-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Bot className="h-4 w-4 text-emerald-400" />
              <span>VoxiaAI Autonomous Receptionist</span>
            </div>
            <span className="rounded bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
              Active Tier
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">$350</span>
            <span className="text-xs text-zinc-400">/ month</span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center justify-between text-[11px]">
              <span>VoxiaAI Pro Platform Plan</span>
              <span className="text-zinc-200">$299/mo</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Telephony SIP & Voice Synthesis Usage</span>
              <span className="text-zinc-200">$51/mo</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Coverage Availability</span>
              <span className="text-emerald-300 font-semibold">168 hrs / week (24/7/365)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Summary Bar */}
      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Net Monthly Cost Savings
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                93.3% Cost Reduction
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">$4,850</span>
              <span className="text-xs text-zinc-400">saved every month</span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-zinc-400">Annualized Savings Run-Rate</span>
            <span className="text-xl font-bold text-emerald-400">
              $58,200 / year
            </span>
          </div>
        </div>

        {/* Visual Cost Reduction Bar */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Operating Cost Distribution</span>
            <span>$350 VoxiaAI vs $5,200 Human Staff</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              style={{ width: "93.3%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
