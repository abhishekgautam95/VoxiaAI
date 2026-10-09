"use client";

import React from "react";
import { Phone, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Integrations</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage telephony carriers, SIP trunks, calendar webhooks, and team access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Phone className="h-4 w-4 text-cyan-400" /> Telephony & SIP Configuration
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Twilio / Telnyx SIP Trunk credentials and incoming call forwarding rules.
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-medium">Connected to Twilio Trunk</span>
            <button className="text-cyan-400 hover:text-cyan-300">Edit Credentials</button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Key className="h-4 w-4 text-cyan-400" /> API Keys & Webhooks
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Webhooks sent immediately upon call completion with full transcripts and payloads.
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-xs">
            <span className="font-mono text-zinc-500">vox_live_9a...712</span>
            <button className="text-cyan-400 hover:text-cyan-300">Rotate Key</button>
          </div>
        </div>
      </div>
    </div>
  );
}
