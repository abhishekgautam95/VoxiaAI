"use client";

import React, { useState } from "react";
import { Bot, Mic, Save, Play } from "lucide-react";

export default function AgentSetupPage() {
  const [agentName, setAgentName] = useState("Sarah (Front Desk)");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Sarah, the welcoming and efficient AI voice receptionist for Apex Health & Dental. Your goal is to greet callers warmly, answer questions regarding office hours and accepted insurance, and assist them in scheduling appointments using the integrated calendar tool. Always confirm patient phone number and name before confirming appointments."
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Agent Setup</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Configure system persona, voice characteristics, knowledge base, and function calling tools.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
        >
          <Save className="h-4 w-4" /> Save & Deploy Live
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prompt Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" /> Receptionist Persona & Instructions
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Natural language prompt instructing the agent on tone, business policies, and conversational guardrails.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">System Prompt</label>
                <textarea
                  rows={8}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:border-cyan-500/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Voice & Synthesis Config */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Mic className="h-4 w-4 text-cyan-400" /> Voice Synthesis Engine
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select voice timbre, emotion, and low-latency voice model.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-zinc-400">Voice Persona</label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                  <span className="font-medium text-zinc-200">Nova (Warm & Friendly)</span>
                  <button type="button" className="text-cyan-400 hover:text-cyan-300">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-400">Response Speed (Latency / Stability)</label>
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Fast (150ms)</span>
                  <span className="text-cyan-400 font-semibold">Balanced (280ms)</span>
                  <span>Deep Reasoning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
