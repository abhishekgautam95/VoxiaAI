"use client";

import React from "react";
import { PieChart, CheckCircle2 } from "lucide-react";
import { CallIntentDistribution } from "./types";
import { CALL_INTENT_DISTRIBUTION } from "./roi-data";

interface IntentDistributionCardProps {
  data?: CallIntentDistribution[];
  totalInquiries?: number;
}

export function IntentDistributionCard({
  data,
  totalInquiries,
}: IntentDistributionCardProps) {
  const intents = data && data.length > 0 ? data : CALL_INTENT_DISTRIBUTION;
  const total = totalInquiries || 1284;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Call Intent & Topic Distribution
            </h3>
            <p className="text-xs text-zinc-400">
              Categorization of caller requests resolved autonomously by VoxiaAI.
            </p>
          </div>
        </div>
        <span className="text-xs text-zinc-400 font-mono">{total.toLocaleString()} Total Inquiries</span>
      </div>

      {/* Intents Progress Breakdown */}
      <div className="mt-5 space-y-4">
        {intents.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">
                {item.category}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-zinc-400 text-[11px]">{item.count} calls</span>
                <span className="font-bold text-white">{item.percentage}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-300`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> First-Call Resolution: 94.1%
        </span>
        <span>Reduces receptionist burnout</span>
      </div>
    </div>
  );
}
