"use client";

import React from "react";
import {
  Calendar,
  Download,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { DateRangeKey } from "./types";

interface AnalyticsHeaderProps {
  selectedRange: DateRangeKey;
  onRangeChange: (range: DateRangeKey) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  onExportReport: () => void;
}

export function AnalyticsHeader({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  onExportReport,
}: AnalyticsHeaderProps) {
  const rangeButtons: { id: DateRangeKey; label: string }[] = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Executive Intelligence & Savings
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Analytics & Financial ROI
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time performance metrics and cost-savings analysis of your AI receptionist.
          </p>
        </div>

        {/* Date Range Picker Filter + Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Pill Selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs shadow-sm">
            {rangeButtons.map((btn) => {
              const isActive = selectedRange === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    onRangeChange(btn.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  {btn.id === "custom" && <Calendar className="h-3 w-3 text-cyan-400" />}
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={onExportReport}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            title="Download complete financial ROI report"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Sub-Bar (When Custom is selected) */}
      {selectedRange === "custom" && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950 p-3 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Filter className="h-3.5 w-3.5 text-cyan-400" /> Custom Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
            />
            <span className="text-zinc-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <span className="text-[11px] text-emerald-400 ml-auto flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Filter Applied
          </span>
        </div>
      )}
    </div>
  );
}
