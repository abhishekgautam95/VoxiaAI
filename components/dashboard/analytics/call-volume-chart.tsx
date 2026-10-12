"use client";

import React from "react";
import { BarChart3, Clock } from "lucide-react";
import { HourlyCallVolume } from "./types";
import { HOURLY_CALL_VOLUMES } from "./roi-data";

interface CallVolumeChartProps {
  data?: HourlyCallVolume[];
}

export function CallVolumeChart({ data }: CallVolumeChartProps) {
  const volumes = data && data.length > 0 ? data : HOURLY_CALL_VOLUMES;
  const maxCallCount = Math.max(...volumes.map((h) => h.totalCalls), 1);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Hourly Call Volume & Deflection Distribution
            </h3>
            <p className="text-xs text-zinc-400">
              Volume breakdown across operating hours showing AI resolution vs total calls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
            <span className="text-zinc-300">AI Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-700" />
            <span className="text-zinc-400">Escalated</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="mt-6 space-y-3">
        <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-zinc-800">
          {volumes.map((item) => {
            const heightPercent = Math.round((item.totalCalls / maxCallCount) * 100);
            const aiHeightPercent = Math.round((item.aiResolved / item.totalCalls) * 100);

            return (
              <div
                key={item.hour}
                className="group relative flex-1 flex flex-col items-center h-full justify-end"
              >
                {/* Hover Tooltip */}
                <div className="pointer-events-none absolute -top-12 z-20 hidden group-hover:flex flex-col items-center rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-200 shadow-xl whitespace-nowrap">
                  <span className="font-semibold text-white">{item.hour}</span>
                  <span className="text-cyan-400">
                    {item.aiResolved} of {item.totalCalls} calls ({item.deflectionPercent}%)
                  </span>
                </div>

                {/* Stacked Bar */}
                <div
                  className="w-full max-w-[28px] rounded-t-md overflow-hidden bg-zinc-800 transition-all duration-200 group-hover:brightness-125"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500"
                    style={{ height: `${aiHeightPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Hour Labels */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
          {HOURLY_CALL_VOLUMES.map((item) => (
            <span key={item.hour} className="text-center truncate max-w-[45px]">
              {item.hour}
            </span>
          ))}
        </div>
      </div>

      {/* Chart Summary Footer */}
      <div className="mt-5 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>
            Peak Traffic Window: <strong>10:00 AM – 11:30 AM</strong> (182 calls/hr)
          </span>
        </div>
        <span className="text-emerald-400 font-medium">
          Zero queue delay maintained across all peak windows
        </span>
      </div>
    </div>
  );
}
