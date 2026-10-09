"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Play,
  PhoneIncoming,
  Bot,
  Sliders,
} from "lucide-react";

interface RecentCall {
  id: string;
  caller: string;
  phone: string;
  time: string;
  duration: string;
  intent: "Appointment" | "Emergency" | "Inquiry" | "Prescription";
  status: "Completed" | "Booked" | "Transferred";
  sentiment: "Positive" | "Neutral";
  summary: string;
}

const recentCalls: RecentCall[] = [
  {
    id: "call-9021",
    caller: "Eleanor Vance",
    phone: "+1 (415) 329-8812",
    time: "2 mins ago",
    duration: "2m 14s",
    intent: "Appointment",
    status: "Booked",
    sentiment: "Positive",
    summary: "Booked routine dental cleaning for Tuesday, Oct 14 at 10:30 AM with Dr. Smith.",
  },
  {
    id: "call-9020",
    caller: "Marcus Brody",
    phone: "+1 (510) 902-1144",
    time: "14 mins ago",
    duration: "1m 45s",
    intent: "Inquiry",
    status: "Completed",
    sentiment: "Positive",
    summary: "Inquired about insurance network compatibility (Delta Dental PPO accepted).",
  },
  {
    id: "call-9019",
    caller: "Sophia Martinez",
    phone: "+1 (408) 773-4521",
    time: "32 mins ago",
    duration: "3m 05s",
    intent: "Prescription",
    status: "Transferred",
    sentiment: "Neutral",
    summary: "Requested post-op pain medication refill; routed to triage nurse queue.",
  },
  {
    id: "call-9018",
    caller: "David Chen",
    phone: "+1 (650) 412-8903",
    time: "1 hr ago",
    duration: "1m 58s",
    intent: "Appointment",
    status: "Booked",
    sentiment: "Positive",
    summary: "Rescheduled root canal consultation to Friday, Oct 17 at 2:00 PM.",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
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
            <span className="font-medium text-zinc-200">Apex Health & Dental</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent-setup"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 shadow-sm hover:border-zinc-700 hover:bg-zinc-850 hover:text-white transition-all"
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Calls */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Today&apos;s Calls</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-cyan-400 border border-zinc-700/50">
              <PhoneIncoming className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">142</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="flex items-center text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +18.4%
              </span>
              <span className="text-zinc-500">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* AI Resolution Rate */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">AI Handled Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-emerald-400 border border-zinc-700/50">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">92.3%</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">131 resolved without transfer</span>
            </div>
          </div>
        </div>

        {/* Appointments Booked */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Appointments Booked</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-violet-400 border border-zinc-700/50">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">38</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-medium">Synced with Cal.com</span>
            </div>
          </div>
        </div>

        {/* End-to-End Latency */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Avg Voice Latency</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-amber-400 border border-zinc-700/50">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">460ms</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-400 font-medium">Ultra-low latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Calls Feed & Agent Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Call Logs Table / Feed (2 columns) */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/70">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Live Call Activity</h2>
              <p className="text-xs text-zinc-400">Real-time transcripts, intents, and action outcomes</p>
            </div>
            <Link
              href="/dashboard/calls"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All Logs &rarr;
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 transition-colors hover:bg-zinc-800/20 px-2 -mx-2 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-zinc-200">
                      {call.caller}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {call.phone}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                        call.status === "Booked"
                          ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                          : call.status === "Transferred"
                          ? "bg-amber-950/70 text-amber-400 border border-amber-800/50"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                      }`}
                    >
                      {call.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-xl line-clamp-1">
                    {call.summary}
                  </p>
                </div>

                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400 shrink-0">
                  <span className="flex items-center gap-1 font-mono text-zinc-500 text-[11px]">
                    <Clock className="h-3 w-3" /> {call.duration}
                  </span>
                  <span className="text-zinc-500 text-[11px]">{call.time}</span>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                    title="Play call audio recording"
                  >
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active AI Agent Pipeline Configuration (1 column) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Agent Configuration</h3>
                  <p className="text-[11px] text-zinc-400">Active Receptionist Profile</p>
                </div>
              </div>
              <span className="rounded bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Online
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">Receptionist Persona</span>
                <span className="font-medium text-zinc-200">Sarah (Empathetic & Swift)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">LLM Engine</span>
                <span className="font-mono text-zinc-300 text-[11px]">Voxia-Turbo 2.5 (180ms)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">Voice Synthesis</span>
                <span className="font-medium text-zinc-300">ElevenLabs Turbo v2.5</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">Inbound Phone</span>
                <span className="font-mono text-cyan-400 text-[11px]">+1 (415) 800-4291</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-400">Calendar Sync</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Google & Cal.com
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/70">
              <Link
                href="/dashboard/agent-setup"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-800/70 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700/60 hover:text-white transition-colors"
              >
                <span>Edit Voice, Prompts & Knowledge Base</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Telephony Connection Health */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-zinc-300">
                  Carrier SIP & Webhook Status
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">100% Uptime</span>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Inbound SIP Trunk connected to US-East Twilio gateway with automatic failover routing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
