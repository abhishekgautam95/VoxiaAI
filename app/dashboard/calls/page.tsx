"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Calendar,
  Phone,
  Clock,
  Play,
  PhoneCall,
} from "lucide-react";
import {
  CallRecord,
  CallStatus,
  DbCallItem,
  DbTranscriptItem,
  statusBadgeStyles,
} from "@/components/dashboard/calls/types";
import { mockCalls } from "@/components/dashboard/calls/mock-data";
import { StatusFilter } from "@/components/dashboard/calls/status-filter";
import { TranscriptDrawer } from "@/components/dashboard/calls/transcript-drawer";

export default function CallLogsPage() {
  const [calls, setCalls] = useState<CallRecord[]>(mockCalls);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatus | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  useEffect(() => {
    fetch("/api/calls")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.calls) && data.calls.length > 0) {
          const mapped: CallRecord[] = data.calls.map((c: DbCallItem) => {
            const d = new Date(c.createdAt || c.startedAt || Date.now());
            return {
              id: c.id,
              callId: c.callId,
              dateTime: d.toISOString(),
              date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              time: d.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
              duration:
                c.durationFormatted ||
                `${Math.floor((c.durationSeconds || 0) / 60)}m ${(c.durationSeconds || 0) % 60}s`,
              callerNumber: c.callerNumber,
              status:
                c.status === "APPOINTMENT_BOOKED"
                  ? "Appointment Booked"
                  : c.status === "MISSED"
                    ? "Missed"
                    : "Completed",
              aiSummary:
                c.aiSummary || "Call handled autonomously by AI receptionist.",
              keyTakeaways: Array.isArray(c.keyTakeaways)
                ? c.keyTakeaways
                : [],
              transcript: (c.transcripts || []).map((t: DbTranscriptItem) => ({
                id: t.id,
                role: t.role === "AI" ? "ai" : "user",
                text: t.text,
                timestamp: t.timestamp,
              })),
              audioDurationSec: c.audioDurationSec || c.durationSeconds || 60,
            };
          });
          setCalls(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered calls
  const filteredCalls = calls.filter((call) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesPhone = call.callerNumber.toLowerCase().includes(q);
      const matchesId = call.callId.toLowerCase().includes(q);
      if (!matchesPhone && !matchesId) return false;
    }

    // Status filter
    if (statusFilter !== "All" && call.status !== statusFilter) return false;

    // Date range filter
    if (dateFrom) {
      const callDate = new Date(call.dateTime);
      const from = new Date(dateFrom);
      if (callDate < from) return false;
    }
    if (dateTo) {
      const callDate = new Date(call.dateTime);
      const to = new Date(dateTo + "T23:59:59");
      if (callDate > to) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      "Call ID",
      "Caller Phone",
      "Date",
      "Time",
      "Duration",
      "Status",
      "AI Summary",
    ];
    const rows = filteredCalls.map((c) => [
      `"${c.callId}"`,
      `"${c.callerNumber}"`,
      `"${c.date}"`,
      `"${c.time}"`,
      `"${c.duration}"`,
      `"${c.status}"`,
      `"${c.aiSummary.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute(
      "download",
      `voxia-calls-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Call Logs & Transcripts
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Audit recordings, sentiment analysis, and conversational traces for
              all inbound calls.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-300 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* ── Search & Filter Bar ──────────────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone number or call ID..."
              className="w-full rounded-lg border border-zinc-800/80 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date From */}
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                title="From date"
              />
            </div>

            <span className="text-xs text-zinc-500">to</span>

            {/* Date To */}
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                title="To date"
              />
            </div>

            {/* Status Filter */}
            <StatusFilter
              selected={statusFilter}
              onChange={setStatusFilter}
            />

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "All" || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900 px-2.5 py-2 text-[11px] font-semibold text-zinc-400 hover:border-cyan-500/30 hover:text-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Call Logs Table ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/80">
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Call ID
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Date / Time
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Duration
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Caller Number
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
                    Recording
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredCalls.length > 0 ? (
                  filteredCalls.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="group cursor-pointer transition-colors hover:bg-zinc-900"
                    >
                      {/* Call ID */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-cyan-400">
                          {call.callId}
                        </span>
                      </td>

                      {/* Date / Time */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="text-xs font-medium text-zinc-200">
                          {call.date}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {call.time}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          {call.duration}
                        </span>
                      </td>

                      {/* Caller Number */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800/80 text-zinc-400">
                            <Phone className="h-2.5 w-2.5" />
                          </div>
                          <span className="font-mono text-xs text-zinc-200">
                            {call.callerNumber}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusBadgeStyles[call.status]}`}
                        >
                          {call.status}
                        </span>
                      </td>

                      {/* Audio Button */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCall(call);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Play</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-500">
                        <PhoneCall className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 text-sm font-bold tracking-wide text-zinc-100">
                        No calls found
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        Try adjusting your search or filter criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Count */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3 bg-zinc-900/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
              Showing {filteredCalls.length} of {calls.length} calls
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
              Click any row to view transcript
            </span>
          </div>
        </div>
      </div>

      {/* ── Transcript Drawer (Slide-over) ──────────────────────────── */}
      {selectedCall && (
        <TranscriptDrawer
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </>
  );
}
