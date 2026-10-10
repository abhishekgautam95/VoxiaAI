"use client";

import React from "react";
import {
  CalendarCheck,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Wrench,
  Link2,
} from "lucide-react";
import { AgentConfig } from "./types";

interface ToolsTabProps {
  config: AgentConfig;
  onChange: (updates: Partial<AgentConfig>) => void;
}

export function ToolsTab({ config, onChange }: ToolsTabProps) {
  return (
    <div className="space-y-6">
      {/* Function Calling & Integrations */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Autonomous Tools & Function Calling
            </h3>
            <p className="text-xs text-zinc-400">
              Enable the AI agent to interact with live calendars, dispatch SMS reminders, and consult knowledge bases during calls.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Calendar Booking Tool */}
          <div className="flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Live Calendar Scheduling (Cal.com / Google Calendar)
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 max-w-md">
                  Allows the agent to search available slots in real-time and lock appointments directly into your business calendar.
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Google Calendar Connected (Primary Doctor Schedule)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onChange({
                  calendarBookingEnabled: !config.calendarBookingEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.calendarBookingEnabled ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.calendarBookingEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* FAQ Knowledge Base */}
          <div className="flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Clinic & Business Knowledge Base (RAG)
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 max-w-md">
                  Gives the agent semantic search over insurance policies, service pricing sheets, and practitioner bios.
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-cyan-300">
                  <Link2 className="h-3 w-3" />
                  <span>14 Documents Indexed (PDFs, FAQ Guidelines)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onChange({
                  faqKnowledgeEnabled: !config.faqKnowledgeEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.faqKnowledgeEnabled ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.faqKnowledgeEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* SMS Follow-ups */}
          <div className="flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Post-Call Instant SMS Confirmation
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 max-w-md">
                  Automatically texts callers appointment confirmations, parking map links, and intake forms after the call concludes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onChange({
                  smsFollowUpEnabled: !config.smsFollowUpEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.smsFollowUpEnabled ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.smsFollowUpEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Call Recording & Compliance */}
          <div className="flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  HIPAA-Compliant Audio Recording & Transcripts
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 max-w-md">
                  Encrypts call audio end-to-end and generates PII-redacted transcripts with clinical outcome summaries.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onChange({
                  callRecordingEnabled: !config.callRecordingEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.callRecordingEnabled ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.callRecordingEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
