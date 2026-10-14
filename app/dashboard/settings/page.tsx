"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  Key,
  Calendar,
  Bot,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  X,
  Check,
  Users,
} from "lucide-react";
import { AuditLogsView } from "@/components/dashboard/settings/audit-logs-view";
import { BillingView } from "@/components/dashboard/settings/billing-view";
import { TeamView } from "@/components/dashboard/settings/team-view";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"integrations" | "audit" | "billing" | "team">("integrations");
  const [twilioSid, setTwilioSid] = useState("AC993817112048f0");
  const [webhookUrl, setWebhookUrl] = useState("https://api.voxia.ai/webhooks/calls/v1");
  const [elevenLabsKey, setElevenLabsKey] = useState("••••••••••••••••••••••••");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [apiKey, setApiKey] = useState("vox_live_9a712f91bb2049d");

  // System Health Telemetry
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    dbLatencyMs: number;
  } | null>(null);

  // Calendar Sync Modal
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarProvider, setCalendarProvider] = useState<"GOOGLE_CALENDAR" | "CAL_COM">("GOOGLE_CALENDAR");
  const [calendarEmail, setCalendarEmail] = useState("primary@apexhealth.io");
  const [calendarName, setCalendarName] = useState("Dr. Sarah Smith - Primary Chair");
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarToast, setCalendarToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          if (data.twilioSid) setTwilioSid(data.twilioSid);
          if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.elevenLabsConfigured) {
            setElevenLabsKey("••••••••••••••••••••••••");
          }
        }
      })
      .catch(() => {});

    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((health) => {
        if (active && health) {
          setSystemHealth({
            status: health.status || "OPERATIONAL",
            dbLatencyMs: health.components?.database?.latencyMs || 2,
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleConnectCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingCalendar(true);
    try {
      const res = await fetch("/api/integrations/calendar/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: calendarProvider,
          accountEmail: calendarEmail,
          calendarName,
          bufferMinutes,
        }),
      });
      if (res.ok) {
        setIsCalendarModalOpen(false);
        setCalendarToast(
          `${calendarProvider === "GOOGLE_CALENDAR" ? "Google Calendar" : "Cal.com"} synced with 2-way conflict avoidance!`
        );
        setTimeout(() => setCalendarToast(null), 4000);
      }
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const res = await fetch(`/api/integrations/calendar/connect?provider=${calendarProvider}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsCalendarModalOpen(false);
        setCalendarToast(`Calendar disconnected.`);
        setTimeout(() => setCalendarToast(null), 4000);
      }
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twilioSid,
          webhookUrl,
          elevenLabsKey,
        }),
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotateKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      const rand = Math.random().toString(36).substring(2, 10);
      setApiKey(`vox_live_${rand}bc8`);
      setIsRotating(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Integrations</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage telephony carriers, SIP trunks, calendar webhooks, and team access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {systemHealth && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-medium text-zinc-300">System: {systemHealth.status}</span>
              <span className="text-zinc-600">|</span>
              <span className="font-mono text-zinc-400">{systemHealth.dbLatencyMs}ms DB</span>
            </div>
          )}
          {isSaved && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-1.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Settings saved and applied to database!</span>
            </div>
          )}
          {calendarToast && (
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-950/80 px-3 py-1.5 text-xs text-violet-300">
              <CheckCircle2 className="h-4 w-4 text-violet-400" />
              <span>{calendarToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "integrations"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>Telephony & Integrations</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "audit"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Security & Compliance Audit Trail</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "billing"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Plans, Billing & Quotas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "team"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team & Staff Access</span>
        </button>
      </div>

      {activeTab === "team" ? (
        <TeamView />
      ) : activeTab === "audit" ? (
        <AuditLogsView />
      ) : activeTab === "billing" ? (
        <BillingView />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telephony SIP Configuration */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Phone className="h-4 w-4 text-cyan-400" /> Telephony & SIP Trunk Configuration
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Twilio / Telnyx SIP Trunk credentials and incoming call routing parameters.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400">Carrier Account SID</label>
                <input
                  type="text"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected to Twilio Trunk (Active)
                </span>
                <span className="text-zinc-500 text-[11px]">Region: US-East (Virginia)</span>
              </div>
            </div>
          </div>

          {/* Calendar Sync */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Calendar className="h-4 w-4 text-violet-400" /> Calendar & Scheduling Sync
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time two-way synchronization to prevent double-booking and schedule conflict.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Google Calendar OAuth</p>
                    <p className="text-[11px] text-zinc-500">primary@apexhealth.io (Synced)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarProvider("GOOGLE_CALENDAR");
                    setIsCalendarModalOpen(true);
                  }}
                  className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white transition-colors"
                >
                  Reconnect
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Cal.com API</p>
                    <p className="text-[11px] text-zinc-500">API Key Active (Conflict avoidance on)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarProvider("CAL_COM");
                    setIsCalendarModalOpen(true);
                  }}
                  className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Voice Engine (ElevenLabs) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Bot className="h-4 w-4 text-amber-400" /> Speech & Synthesis Provider (ElevenLabs)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              API key used for streaming low-latency voice synthesis and custom voice cloning.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400">ElevenLabs API Key</label>
                <input
                  type="password"
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="text-[11px] text-zinc-500 flex justify-between">
                <span>Model: Eleven Turbo v2.5 (180ms latency)</span>
                <span className="text-emerald-400">Quota: 84% Available</span>
              </div>
            </div>
          </div>

          {/* API Keys & Webhooks */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Key className="h-4 w-4 text-cyan-400" /> API Keys & Webhooks
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Webhooks dispatched immediately upon call completion with full transcripts and payloads.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400">Call Completion Webhook URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-zinc-400 text-[11px]">{apiKey}</span>
                <button
                  type="button"
                  onClick={handleRotateKey}
                  disabled={isRotating}
                  className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isRotating ? "animate-spin" : ""}`} />
                  Rotate Key
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{isSaving ? "Saving..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
      )}

      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-950/60 border border-violet-700/50 text-violet-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Configure {calendarProvider === "GOOGLE_CALENDAR" ? "Google Calendar" : "Cal.com"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Two-way slot synchronization and conflict buffer management
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnectCalendar} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Calendar Account / Email
                </label>
                <input
                  type="email"
                  required
                  value={calendarEmail}
                  onChange={(e) => setCalendarEmail(e.target.value)}
                  placeholder="e.g. reception@apexhealth.io"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Target Schedule Name
                </label>
                <input
                  type="text"
                  required
                  value={calendarName}
                  onChange={(e) => setCalendarName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Smith - Primary Chair"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Slot Buffer Padding
                  </label>
                  <select
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
                  >
                    <option value={5}>5 minutes buffer</option>
                    <option value={10}>10 minutes buffer</option>
                    <option value={15}>15 minutes buffer</option>
                    <option value={30}>30 minutes buffer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Conflict Strategy
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Auto-Skip Busy</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 text-[11px] text-zinc-400 leading-relaxed">
                VoxiaAI continuously listens for webhook delta events. When an appointment is scheduled on-call, your calendar updates in under 400ms.
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleDisconnectCalendar}
                  disabled={isConnectingCalendar}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  Disconnect
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCalendarModalOpen(false)}
                    className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConnectingCalendar}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-500 transition-colors disabled:opacity-50"
                  >
                    {isConnectingCalendar && (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>Save & Sync 2-Way</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
