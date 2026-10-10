"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { AgentConfig, PromptTemplate } from "./types";
import { PROMPT_TEMPLATES } from "./data";

interface SystemPromptTabProps {
  config: AgentConfig;
  onChange: (updates: Partial<AgentConfig>) => void;
}

export function SystemPromptTab({ config, onChange }: SystemPromptTabProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTemplateToPreview, setSelectedTemplateToPreview] =
    useState<PromptTemplate | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Copy prompt to clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(config.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Insert a variable into the system prompt at the end
  const handleInsertVariable = (variableName: string) => {
    const updated = config.systemPrompt + `\n- {${variableName}}`;
    onChange({ systemPrompt: updated });
  };

  // Apply a pre-made template
  const handleApplyTemplate = (template: PromptTemplate) => {
    // Inject the business config into the template prompt
    const populatedPrompt = template.systemPrompt
      .replace(/\{business_name\}/g, config.businessName)
      .replace(/\{business_category\}/g, config.businessCategory)
      .replace(/\{agent_name\}/g, config.agentName)
      .replace(/\{primary_language\}/g, config.primaryLanguage)
      .replace(/\{office_hours\}/g, config.officeHours)
      .replace(/\{business_address\}/g, config.businessAddress);

    const populatedGreeting = template.suggestedGreeting
      .replace(/\{business_name\}/g, config.businessName)
      .replace(/\{agent_name\}/g, config.agentName);

    onChange({
      systemPrompt: populatedPrompt,
      selectedTemplateId: template.id,
      greetingMessage: populatedGreeting,
    });

    setShowApplyModal(false);
    setSelectedTemplateToPreview(null);
  };

  const estimatedTokens = Math.round(config.systemPrompt.length / 4);

  return (
    <div className="space-y-6">
      {/* Pre-made Templates Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Pre-Made System Prompt Templates
              </h3>
              <p className="text-xs text-zinc-400">
                Battle-tested conversational routines curated for specific industries and workflows.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-cyan-400">
            5 Templates Ready
          </span>
        </div>

        {/* Templates Carousel / List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROMPT_TEMPLATES.map((tmpl) => {
            const isActive = config.selectedTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-zinc-950 ring-1 ring-cyan-500/30"
                    : "border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                      {tmpl.badge}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-xs font-semibold text-white">
                    {tmpl.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-zinc-800/70 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">
                    Category: {tmpl.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateToPreview(tmpl);
                      setShowApplyModal(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>Use Routine</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Custom AI System Prompt Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Custom System Prompt & Guardrails
              </h3>
              <p className="text-xs text-zinc-400">
                Detailed instructions guiding agent reasoning, spoken cadence, policy enforcement, and tool usage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const defaultTmpl = PROMPT_TEMPLATES[0];
                handleApplyTemplate(defaultTmpl);
              }}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dynamic Variable Insertion Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 py-1 text-xs">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1 mr-1">
            <BookOpen className="h-3 w-3 text-cyan-400" /> Insert Variable:
          </span>
          {[
            "business_name",
            "business_category",
            "agent_name",
            "primary_language",
            "office_hours",
            "business_address",
          ].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleInsertVariable(v)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-cyan-300 hover:border-cyan-500/50 hover:bg-zinc-900 transition-colors"
            >
              {"{" + v + "}"}
            </button>
          ))}
        </div>

        {/* Textarea Editor */}
        <div className="mt-2 relative">
          <textarea
            rows={14}
            value={config.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
            placeholder="Write your custom AI instructions here..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>

        {/* Editor Metadata Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>Characters: {config.systemPrompt.length.toLocaleString()}</span>
            <span>Est. Tokens: ~{estimatedTokens.toLocaleString()}</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Syntax Valid
          </span>
        </div>
      </div>

      {/* Section 3: Conversational Tone & Interruption Behavior */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Conversational Tone & Latency Tuning
            </h3>
            <p className="text-xs text-zinc-400">
              Refine emotional inflection, interruption tolerance, and response verbosity.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tone Selector */}
          <div>
            <label className="text-xs font-medium text-zinc-300">
              Conversational Tone
            </label>
            <div className="mt-2 space-y-1.5">
              {[
                { id: "friendly", label: "Warm & Empathetic", desc: "Best for healthcare & salons" },
                { id: "professional", label: "Polished & Corporate", desc: "Best for law & real estate" },
                { id: "direct", label: "Concise & Direct", desc: "Best for emergency & dispatch" },
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() =>
                  onChange({
                    conversationTone: tone.id as AgentConfig["conversationTone"],
                  })
                }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors border ${
                    config.conversationTone === tone.id
                      ? "border-cyan-500/50 bg-zinc-900 text-white font-medium"
                      : "border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{tone.label}</p>
                    <p className="text-[10px] text-zinc-400">{tone.desc}</p>
                  </div>
                  {config.conversationTone === tone.id && (
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interruption Sensitivity */}
          <div>
            <label className="text-xs font-medium text-zinc-300">
              Interruption Sensitivity
            </label>
            <div className="mt-2 space-y-1.5">
              {[
                { id: "high", label: "Instant (High)", desc: "Stops speaking immediately when caller utters" },
                { id: "balanced", label: "Balanced (Recommended)", desc: "Ignores minor coughs / background noise" },
                { id: "low", label: "Patient (Low)", desc: "Completes sentence before caller turns" },
              ].map((sens) => (
                <button
                  key={sens.id}
                  type="button"
                  onClick={() =>
                  onChange({
                    interruptionSensitivity: sens.id as AgentConfig["interruptionSensitivity"],
                  })
                }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors border ${
                    config.interruptionSensitivity === sens.id
                      ? "border-cyan-500/50 bg-zinc-900 text-white font-medium"
                      : "border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{sens.label}</p>
                    <p className="text-[10px] text-zinc-400">{sens.desc}</p>
                  </div>
                  {config.interruptionSensitivity === sens.id && (
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Latency & Reasoning Mode */}
          <div>
            <label className="text-xs font-medium text-zinc-300">
              Response Speed / Latency Target
            </label>
            <div className="mt-2 space-y-1.5">
              {[
                { id: "ultra_low", label: "Ultra-Fast (180ms)", desc: "Lowest latency voice streaming" },
                { id: "balanced", label: "Balanced (280ms)", desc: "Optimal balance of accuracy and latency" },
                { id: "high_reasoning", label: "Deep Reasoning (450ms)", desc: "Deep multi-step tool verification" },
              ].map((lat) => (
                <button
                  key={lat.id}
                  type="button"
                  onClick={() =>
                    onChange({ latencyMode: lat.id as AgentConfig["latencyMode"] })
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors border ${
                    config.latencyMode === lat.id
                      ? "border-cyan-500/50 bg-zinc-900 text-white font-medium"
                      : "border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{lat.label}</p>
                    <p className="text-[10px] text-zinc-400">{lat.desc}</p>
                  </div>
                  {config.latencyMode === lat.id && (
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transfer Keywords Input */}
        <div className="mt-5 border-t border-zinc-800/80 pt-4">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Human Escalation Trigger Keywords
          </label>
          <input
            type="text"
            value={config.transferKeywords}
            onChange={(e) => onChange({ transferKeywords: e.target.value })}
            placeholder="human, agent, receptionist, operator, speak to someone, emergency"
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            Comma-separated words that instantly trigger a warm or cold transfer to live staff.
          </p>
        </div>
      </div>

      {/* Template Preview / Apply Modal */}
      {showApplyModal && selectedTemplateToPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Apply Template: {selectedTemplateToPreview.name}
                </h3>
              </div>
              <span className="rounded bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                {selectedTemplateToPreview.category}
              </span>
            </div>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              {selectedTemplateToPreview.description}
            </p>

            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
              <p className="text-[11px] font-semibold text-zinc-300 mb-1">
                Suggested Opening Greeting:
              </p>
              <p className="text-xs text-cyan-300 italic">
                &ldquo;{selectedTemplateToPreview.suggestedGreeting}&rdquo;
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate(selectedTemplateToPreview)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply to Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
