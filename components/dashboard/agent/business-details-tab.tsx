"use client";

import React from "react";
import {
  Building2,
  Globe2,
  Clock,
  Phone,
  MapPin,
  MessageSquare,
  Bot,
  Check,
} from "lucide-react";
import { AgentConfig, PrimaryLanguage } from "./types";
import { BUSINESS_CATEGORIES, PRIMARY_LANGUAGES } from "./data";

interface BusinessDetailsTabProps {
  config: AgentConfig;
  onChange: (updates: Partial<AgentConfig>) => void;
}

export function BusinessDetailsTab({
  config,
  onChange,
}: BusinessDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Business Identity */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Business Details & Categorization
              </h3>
              <p className="text-xs text-zinc-400">
                Foundational information the AI voice agent uses to represent your company on calls.
              </p>
            </div>
          </div>
          <span className="rounded bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300">
            Core Profile
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Name */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>Business / Organization Name</span>
              <span className="text-[10px] text-cyan-400 font-normal">Required</span>
            </label>
            <div className="mt-1.5 relative">
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => onChange({ businessName: e.target.value })}
                placeholder="e.g. Apex Health & Dental Studio"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Spoken during greetings and confirmations.
            </p>
          </div>

          {/* Primary Language */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-cyan-400" /> Primary Language
              </span>
              <span className="text-[10px] text-zinc-400">10 Dialects</span>
            </label>
            <div className="mt-1.5 relative">
              <select
                value={config.primaryLanguage}
                onChange={(e) =>
                  onChange({ primaryLanguage: e.target.value as PrimaryLanguage })
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 appearance-none cursor-pointer"
              >
                {PRIMARY_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flag} {lang.label} ({lang.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-2.5 text-xs text-zinc-400">
                ▼
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Determines automatic speech recognition and synthesized response grammar.
            </p>
          </div>
        </div>

        {/* Business Category Grid / Selector */}
        <div className="mt-5">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between mb-2">
            <span>Business Category</span>
            <span className="text-[10px] text-zinc-400">
              Select category to optimize agent vocabulary
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {BUSINESS_CATEGORIES.map((cat) => {
              const isSelected = config.businessCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange({ businessCategory: cat.id })}
                  className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                    isSelected
                      ? "border-cyan-500/50 bg-gradient-to-br from-cyan-950/30 to-zinc-900 text-white ring-1 ring-cyan-500/30"
                      : "border-zinc-800/80 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-lg">{cat.icon}</span>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-semibold text-zinc-100">
                    {cat.label}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[10px] text-zinc-400">
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Contact, Hours & Location */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Operating Schedule & Telephony Link
            </h3>
            <p className="text-xs text-zinc-400">
              Hours and contact information the agent will reference when callers ask.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Phone */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-cyan-400" /> Inbound Business Phone Line
            </label>
            <input
              type="text"
              value={config.businessPhone}
              onChange={(e) => onChange({ businessPhone: e.target.value })}
              placeholder="+1 (415) 800-4291"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Assigned SIP trunk or Twilio/Telnyx forwarding line.
            </p>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" /> Standard Operating Hours
            </label>
            <input
              type="text"
              value={config.officeHours}
              onChange={(e) => onChange({ officeHours: e.target.value })}
              placeholder="Mon-Fri 8:00 AM - 6:00 PM EST"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Agent informs callers if they call outside of this window.
            </p>
          </div>
        </div>

        {/* Physical Address */}
        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Physical Location & Parking Directions
          </label>
          <input
            type="text"
            value={config.businessAddress}
            onChange={(e) => onChange({ businessAddress: e.target.value })}
            placeholder="450 Sutter St, Suite 1400, San Francisco, CA 94108"
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            Directions given to callers asking how to find your office or clinic.
          </p>
        </div>
      </div>

      {/* Section 3: Agent Persona & Opening Greeting */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Agent Persona & Opening Spoken Line
            </h3>
            <p className="text-xs text-zinc-400">
              How the AI introduces itself the moment an incoming phone call is picked up.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs font-medium text-zinc-300">
              Agent Spoken Name / Persona
            </label>
            <input
              type="text"
              value={config.agentName}
              onChange={(e) => onChange({ agentName: e.target.value })}
              placeholder="Sarah (Front Desk)"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Name used in conversational introduction.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-cyan-400" /> First Spoken Greeting Message
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Supports {"{business_name}"}, {"{agent_name}"}
              </span>
            </label>
            <textarea
              rows={2}
              value={config.greetingMessage}
              onChange={(e) => onChange({ greetingMessage: e.target.value })}
              placeholder="Thank you for calling Apex Health & Dental. My name is Sarah..."
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Spoken immediately when call connects. Should be warm, welcoming, and under 25 words.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
