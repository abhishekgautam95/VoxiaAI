"use client";

import React from "react";
import Link from "next/link";
import {
  PhoneIncoming,
  Clock,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Phone,
  Play,
  Sliders,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetricCard {
  id: string;
  label: string;
  value: string;
  change: string;
  changeDirection: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

type CallOutcome = "Booked" | "Inquiry" | "Missed";

interface RecentCall {
  id: string;
  callerPhone: string;
  duration: string;
  outcome: CallOutcome;
  time: string;
}

interface UpcomingAppointment {
  id: string;
  customerName: string;
  phoneNumber: string;
  timeSlot: string;
  date: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const metricCards: MetricCard[] = [
  {
    id: "total-calls",
    label: "Total Calls Received",
    value: "1,284",
    change: "+12.5%",
    changeDirection: "up",
    icon: PhoneIncoming,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "total-minutes",
    label: "Total Minutes Used",
    value: "342 mins",
    change: "+8.2%",
    changeDirection: "up",
    icon: Clock,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "appointments-booked",
    label: "Appointments Booked",
    value: "89",
    change: "+23.1%",
    changeDirection: "up",
    icon: CalendarCheck,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    id: "conversion-rate",
    label: "Call Conversion Rate",
    value: "68%",
    change: "+4.3%",
    changeDirection: "up",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

const recentCalls: RecentCall[] = [
  {
    id: "call-1001",
    callerPhone: "+1 (415) 329-8812",
    duration: "2m 14s",
    outcome: "Booked",
    time: "2 mins ago",
  },
  {
    id: "call-1002",
    callerPhone: "+1 (510) 902-1144",
    duration: "1m 45s",
    outcome: "Inquiry",
    time: "14 mins ago",
  },
  {
    id: "call-1003",
    callerPhone: "+1 (408) 773-4521",
    duration: "0m 32s",
    outcome: "Missed",
    time: "28 mins ago",
  },
  {
    id: "call-1004",
    callerPhone: "+1 (650) 412-8903",
    duration: "3m 05s",
    outcome: "Booked",
    time: "1 hr ago",
  },
  {
    id: "call-1005",
    callerPhone: "+1 (925) 661-3347",
    duration: "1m 18s",
    outcome: "Inquiry",
    time: "1 hr ago",
  },
];

const upcomingAppointments: UpcomingAppointment[] = [
  {
    id: "appt-1",
    customerName: "Eleanor Vance",
    phoneNumber: "+1 (415) 329-8812",
    timeSlot: "10:30 AM – 11:00 AM",
    date: "Today, Oct 9",
  },
  {
    id: "appt-2",
    customerName: "David Chen",
    phoneNumber: "+1 (650) 412-8903",
    timeSlot: "2:00 PM – 2:30 PM",
    date: "Today, Oct 9",
  },
  {
    id: "appt-3",
    customerName: "Maria Rodriguez",
    phoneNumber: "+1 (408) 556-7192",
    timeSlot: "9:15 AM – 9:45 AM",
    date: "Tomorrow, Oct 10",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const outcomeBadgeStyles: Record<CallOutcome, string> = {
  Booked:
    "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50",
  Inquiry:
    "bg-sky-950/70 text-sky-400 border border-sky-800/50",
  Missed:
    "bg-rose-950/70 text-rose-400 border border-rose-800/50",
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Receptionist Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Answering
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            AI Receptionist &ldquo;Sarah&rdquo; is managing inbound calls for{" "}
            <span className="font-medium text-zinc-200">
              Apex Health &amp; Dental
            </span>
            .
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 shadow-sm hover:border-zinc-700 hover:text-white transition-all"
          >
            <Sliders className="h-3.5 w-3.5 text-zinc-400" />
            <span>Tune Agent Prompt</span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Voice Call</span>
          </button>
        </div>
      </div>

      {/* ── Top Metric Cards (4-grid) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition-colors hover:border-zinc-700/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-white">
                  {card.value}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span
                    className={`flex items-center font-medium ${
                      card.changeDirection === "up"
                        ? "text-emerald-400"
                        : card.changeDirection === "down"
                        ? "text-rose-400"
                        : "text-zinc-400"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    {card.change}
                  </span>
                  <span className="text-zinc-500">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Content Grid: Recent Calls + Upcoming Appointments ──── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Recent Call Activity Table (spans 2 cols) ────────────────── */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm lg:col-span-2">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Recent Call Activity
              </h2>
              <p className="text-xs text-zinc-400">
                Last 5 inbound calls with outcomes
              </p>
            </div>
            <Link
              href="/dashboard/calls"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All Logs &rarr;
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Caller Phone
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Duration
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Outcome
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Time
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="group transition-colors hover:bg-zinc-800/20"
                  >
                    {/* Caller Phone */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                          <Phone className="h-3 w-3" />
                        </div>
                        <span className="font-mono text-xs text-zinc-200">
                          {call.callerPhone}
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {call.duration}
                      </span>
                    </td>

                    {/* Outcome Badge */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${outcomeBadgeStyles[call.outcome]}`}
                      >
                        {call.outcome}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-zinc-500">
                      {call.time}
                    </td>

                    {/* Action */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-850 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-zinc-800/80"
                      >
                        <FileText className="h-3 w-3" />
                        <span>View Transcript</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Upcoming Appointments Widget (1 col) ─────────────────────── */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Upcoming Appointments
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Next 3 scheduled
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/appointments"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
              title="View all appointments"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Appointment List */}
          <div className="divide-y divide-zinc-800/50 px-5">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 text-[11px] font-semibold text-white shadow-sm">
                      {appt.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {appt.customerName}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                        <Phone className="h-2.5 w-2.5" />
                        {appt.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 ml-12 flex items-center gap-2">
                  <span className="rounded bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                    {appt.date}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {appt.timeSlot}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-zinc-800/70 px-5 py-3">
            <Link
              href="/dashboard/appointments"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-800/70 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700/60 hover:text-white transition-colors"
            >
              <span>View All Appointments</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
