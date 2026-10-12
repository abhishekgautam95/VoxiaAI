"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  DateRangeKey,
  MetricCardData,
  HourlyCallVolume,
  CallIntentDistribution,
} from "@/components/dashboard/analytics/types";
import {
  ROI_METRICS_BY_RANGE,
  HOURLY_CALL_VOLUMES,
  CALL_INTENT_DISTRIBUTION,
} from "@/components/dashboard/analytics/roi-data";
import { AnalyticsHeader } from "@/components/dashboard/analytics/analytics-header";
import { MetricCardsGrid } from "@/components/dashboard/analytics/metric-cards-grid";
import { RoiCalculatorCard } from "@/components/dashboard/analytics/roi-calculator-card";
import { CallVolumeChart } from "@/components/dashboard/analytics/call-volume-chart";
import { IntentDistributionCard } from "@/components/dashboard/analytics/intent-distribution-card";

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("30d");
  const [customStartDate, setCustomStartDate] = useState("2026-09-10");
  const [customEndDate, setCustomEndDate] = useState("2026-10-10");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MetricCardData[]>(
    ROI_METRICS_BY_RANGE["30d"]
  );
  const [hourlyVolumes, setHourlyVolumes] = useState<HourlyCallVolume[]>(
    HOURLY_CALL_VOLUMES
  );
  const [intentDistribution, setIntentDistribution] = useState<
    CallIntentDistribution[]
  >(CALL_INTENT_DISTRIBUTION);
  const [totalInquiries, setTotalInquiries] = useState<number>(1284);

  useEffect(() => {
    let url = `/api/analytics?range=${selectedRange}`;
    if (selectedRange === "custom") {
      url += `&start=${customStartDate}&end=${customEndDate}`;
    }

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.metrics)) setMetrics(data.metrics);
          if (Array.isArray(data.hourlyVolumes))
            setHourlyVolumes(data.hourlyVolumes);
          if (Array.isArray(data.intentDistribution))
            setIntentDistribution(data.intentDistribution);
          if (typeof data.totalInquiries === "number")
            setTotalInquiries(data.totalInquiries);
        }
      })
      .catch(() => {});
  }, [selectedRange, customStartDate, customEndDate]);

  const handleExportReport = () => {
    const headers = [
      "Metric",
      "Value",
      "Change",
      "Comparison",
      "Context",
      "Details",
    ];
    const rows = metrics.map((m) => [
      `"${m.title}"`,
      `"${m.value}"`,
      `"${m.change}"`,
      `"${m.comparisonLabel}"`,
      `"${m.subtext}"`,
      `"${m.microDetail}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `voxia-roi-report-${selectedRange}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(
      `Financial ROI report exported for ${selectedRange.toUpperCase()}!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-zinc-950/95 px-4 py-3 text-xs text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section with Date Range Filter */}
      <AnalyticsHeader
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
        onExportReport={handleExportReport}
      />

      {/* Financial ROI & Efficiency Metrics (4 Grid Cards) */}
      <MetricCardsGrid metrics={metrics} />

      {/* Side-by-Side Cost Savings Comparison */}
      <RoiCalculatorCard />

      {/* Secondary Analytics Grid: Hourly Call Volume & Intent Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CallVolumeChart data={hourlyVolumes} />
        <IntentDistributionCard
          data={intentDistribution}
          totalInquiries={totalInquiries}
        />
      </div>
    </div>
  );
}
