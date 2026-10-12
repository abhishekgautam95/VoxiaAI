"use client";

import React, { useState, useEffect } from "react";
import { Phone, Key, Calendar, Bot, CheckCircle2, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [twilioSid, setTwilioSid] = useState("AC993817112048f0");
  const [webhookUrl, setWebhookUrl] = useState("https://api.voxia.ai/webhooks/calls/v1");
  const [elevenLabsKey, setElevenLabsKey] = useState("••••••••••••••••••••••••");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [apiKey, setApiKey] = useState("vox_live_9a712f91bb2049d");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.twilioSid) setTwilioSid(data.twilioSid);
          if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.elevenLabsConfigured) {
            setElevenLabsKey("••••••••••••••••••••••••");
          }
        }
      })
      .catch(() => {});
  }, []);

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
        {isSaved && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-1.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Settings saved and applied to database!</span>
          </div>
        )}
      </div>

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
                  className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
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
                  className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
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
    </div>
  );
}
