"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  PhoneCall,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { MetricCardData } from "./types";

interface MetricCardsGridProps {
  metrics: MetricCardData[];
}

export function MetricCardsGrid({ metrics }: MetricCardsGridProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "labor-cost-saved":
        return DollarSign;
      case "revenue-generated":
        return TrendingUp;
      case "deflection-rate":
        return PhoneCall;
      case "avg-handling-time":
        return Clock;
      default:
        return Sparkles;
    }
  };

  const getColorStyles = (color: MetricCardData["accentColor"]) => {
    switch (color) {
      case "emerald":
        return {
          iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          glow: "group-hover:border-emerald-500/40 group-hover:shadow-emerald-950/30",
          pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          accentText: "text-emerald-400",
        };
      case "cyan":
        return {
          iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
          glow: "group-hover:border-cyan-500/40 group-hover:shadow-cyan-950/30",
          pill: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
          accentText: "text-cyan-400",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
          glow: "group-hover:border-indigo-500/40 group-hover:shadow-indigo-950/30",
          pill: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          accentText: "text-indigo-400",
        };
      case "violet":
        return {
          iconBg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
          glow: "group-hover:border-violet-500/40 group-hover:shadow-violet-950/30",
          pill: "bg-violet-500/15 text-violet-400 border-violet-500/30",
          accentText: "text-violet-400",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = getIcon(metric.id);
        const styles = getColorStyles(metric.accentColor);
        const isImprovement =
          metric.id === "avg-handling-time"
            ? metric.changeDirection === "down"
            : metric.changeDirection === "up";

        return (
          <div
            key={metric.id}
            className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${styles.glow}`}
          >
            {/* Card Top: Title & Icon */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 tracking-wide">
                  {metric.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110 ${styles.iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {metric.value}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles.pill}`}
                >
                  {isImprovement ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>
              </div>

              {/* Subtext Comparison */}
              <p className="mt-2 text-xs text-zinc-300 font-medium leading-relaxed">
                {metric.subtext}
              </p>
            </div>

            {/* Micro Details Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="truncate">{metric.microDetail}</span>
              <span className="text-[10px] shrink-0 text-zinc-400 ml-1">
                {metric.comparisonLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
