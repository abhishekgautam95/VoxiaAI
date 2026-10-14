"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Bot,
  Mic,
  Wrench,
  Save,
  RotateCcw,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { AgentConfig } from "@/components/dashboard/agent/types";
import { DEFAULT_AGENT_CONFIG, ELEVENLABS_VOICES } from "@/components/dashboard/agent/data";
import { BusinessDetailsTab } from "@/components/dashboard/agent/business-details-tab";
import { SystemPromptTab } from "@/components/dashboard/agent/system-prompt-tab";
import { VoiceSettingsTab } from "@/components/dashboard/agent/voice-settings-tab";
import { ToolsTab } from "@/components/dashboard/agent/tools-tab";
import { LiveTestWidget } from "@/components/dashboard/agent/live-test-widget";

type ActiveTab = "business" | "prompt" | "voice" | "tools";

export default function AgentConfigPage() {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [activeTab, setActiveTab] = useState<ActiveTab>("business");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFloatingCallOpen, setIsFloatingCallOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("testCall") === "true";
    }
    return false;
  });

  // Load config from database on mount
  useEffect(() => {

    fetch("/api/agent")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.agent) {
          const dbAgent = data.agent;
          const conf =
            dbAgent.configuration && typeof dbAgent.configuration === "object"
              ? (dbAgent.configuration as Record<string, unknown>)
              : {};

          const merged: AgentConfig = {
            ...DEFAULT_AGENT_CONFIG,
            businessName: dbAgent.businessName || DEFAULT_AGENT_CONFIG.businessName,
            businessCategory:
              (dbAgent.businessType as AgentConfig["businessCategory"]) ||
              DEFAULT_AGENT_CONFIG.businessCategory,
            businessAddress: dbAgent.businessAddress || DEFAULT_AGENT_CONFIG.businessAddress,
            officeHours: dbAgent.officeHours || DEFAULT_AGENT_CONFIG.officeHours,
            businessPhone: dbAgent.phoneNumber || DEFAULT_AGENT_CONFIG.businessPhone,
            agentName:
              dbAgent.displayName?.replace(/\s*\(AI Receptionist\)$/i, "") ||
              DEFAULT_AGENT_CONFIG.agentName,
            systemPrompt: dbAgent.systemPrompt || DEFAULT_AGENT_CONFIG.systemPrompt,
            selectedVoiceId: dbAgent.voiceId || DEFAULT_AGENT_CONFIG.selectedVoiceId,
            primaryLanguage:
              (dbAgent.primaryLanguage as AgentConfig["primaryLanguage"]) ||
              DEFAULT_AGENT_CONFIG.primaryLanguage,
            latencyMode:
              (dbAgent.latencyMode as AgentConfig["latencyMode"]) ||
              DEFAULT_AGENT_CONFIG.latencyMode,
            conversationTone:
              (dbAgent.tone as AgentConfig["conversationTone"]) ||
              DEFAULT_AGENT_CONFIG.conversationTone,
            interruptionSensitivity: dbAgent.interruptible ? "balanced" : "low",

            // Configuration JSON properties
            greetingMessage:
              typeof conf.greetingMessage === "string"
                ? conf.greetingMessage
                : DEFAULT_AGENT_CONFIG.greetingMessage,
            selectedTemplateId:
              typeof conf.selectedTemplateId === "string"
                ? conf.selectedTemplateId
                : DEFAULT_AGENT_CONFIG.selectedTemplateId,
            verbosity:
              (conf.verbosity as AgentConfig["verbosity"]) || DEFAULT_AGENT_CONFIG.verbosity,
            transferKeywords:
              typeof conf.transferKeywords === "string"
                ? conf.transferKeywords
                : DEFAULT_AGENT_CONFIG.transferKeywords,
            voiceStability:
              typeof conf.voiceStability === "number"
                ? conf.voiceStability
                : DEFAULT_AGENT_CONFIG.voiceStability,
            clarityBoost:
              typeof conf.clarityBoost === "number"
                ? conf.clarityBoost
                : DEFAULT_AGENT_CONFIG.clarityBoost,
            speakingRate:
              typeof conf.speakingRate === "number"
                ? conf.speakingRate
                : DEFAULT_AGENT_CONFIG.speakingRate,
            ambientNoise:
              (conf.ambientNoise as AgentConfig["ambientNoise"]) ||
              DEFAULT_AGENT_CONFIG.ambientNoise,
            calendarBookingEnabled:
              typeof conf.calendarBookingEnabled === "boolean"
                ? conf.calendarBookingEnabled
                : DEFAULT_AGENT_CONFIG.calendarBookingEnabled,
            faqKnowledgeEnabled:
              typeof conf.faqKnowledgeEnabled === "boolean"
                ? conf.faqKnowledgeEnabled
                : DEFAULT_AGENT_CONFIG.faqKnowledgeEnabled,
            callRecordingEnabled:
              typeof conf.callRecordingEnabled === "boolean"
                ? conf.callRecordingEnabled
                : DEFAULT_AGENT_CONFIG.callRecordingEnabled,
            smsFollowUpEnabled:
              typeof conf.smsFollowUpEnabled === "boolean"
                ? conf.smsFollowUpEnabled
                : DEFAULT_AGENT_CONFIG.smsFollowUpEnabled,
          };
          setConfig(merged);
          setSavedConfig(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const handleConfigChange = (updates: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: `${config.agentName} (AI Receptionist)`,
          businessName: config.businessName,
          businessType: config.businessCategory,
          businessAddress: config.businessAddress,
          officeHours: config.officeHours,
          phoneNumber: config.businessPhone,
          systemPrompt: config.systemPrompt,
          voiceId: config.selectedVoiceId,
          primaryLanguage: config.primaryLanguage,
          latencyMode: config.latencyMode,
          tone: config.conversationTone,
          interruptible: config.interruptionSensitivity !== "low",
          configuration: {
            greetingMessage: config.greetingMessage,
            selectedTemplateId: config.selectedTemplateId,
            verbosity: config.verbosity,
            transferKeywords: config.transferKeywords,
            voiceStability: config.voiceStability,
            clarityBoost: config.clarityBoost,
            speakingRate: config.speakingRate,
            ambientNoise: config.ambientNoise,
            calendarBookingEnabled: config.calendarBookingEnabled,
            faqKnowledgeEnabled: config.faqKnowledgeEnabled,
            callRecordingEnabled: config.callRecordingEnabled,
            smsFollowUpEnabled: config.smsFollowUpEnabled,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to deploy agent configuration");
      }

      setSavedConfig(config);
      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setConfig(savedConfig);
  };

  const currentVoice =
    ELEVENLABS_VOICES.find((v) => v.id === config.selectedVoiceId) ||
    ELEVENLABS_VOICES[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Agent Orchestration Engine
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            AI Voice Agent Configuration
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Configure business identity, customize system prompts with industry routines, select ElevenLabs voice timbre, and test live calls in real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deploying Live...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                <span>Save & Deploy Live</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs text-rose-300 backdrop-blur-md">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-300 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">
              Configuration deployed! Your AI voice receptionist for{" "}
              <strong>{config.businessName}</strong> is now live on inbound SIP lines with {currentVoice.label}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(false)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Agent Overview Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-cyan-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400">Organization</p>
            <p className="truncate text-xs font-semibold text-zinc-200">
              {config.businessName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-indigo-400">
            <Radio className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400">Industry</p>
            <p className="truncate text-xs font-semibold text-zinc-200">
              {config.businessCategory}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-violet-400">
            <Mic className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400">Voice Synthesis</p>
            <p className="truncate text-xs font-semibold text-zinc-200">
              {currentVoice.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-emerald-400">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400">Language</p>
            <p className="truncate text-xs font-semibold text-zinc-200">
              {config.primaryLanguage}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Tabs on Left, Live Test Widget on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tabbed Configuration Panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs Navigation (Shadcn / Tailwind Style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-medium transition-all ${
                activeTab === "business"
                  ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-sm ring-1 ring-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Building2
                className={`h-3.5 w-3.5 ${
                  activeTab === "business" ? "text-cyan-400" : ""
                }`}
              />
              <span>Business Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("prompt")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-medium transition-all ${
                activeTab === "prompt"
                  ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-sm ring-1 ring-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Bot
                className={`h-3.5 w-3.5 ${
                  activeTab === "prompt" ? "text-cyan-400" : ""
                }`}
              />
              <span>System Prompt & Behavior</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-medium transition-all ${
                activeTab === "voice"
                  ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-sm ring-1 ring-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Mic
                className={`h-3.5 w-3.5 ${
                  activeTab === "voice" ? "text-cyan-400" : ""
                }`}
              />
              <span>Voice Engine (ElevenLabs)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-medium transition-all ${
                activeTab === "tools"
                  ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-sm ring-1 ring-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Wrench
                className={`h-3.5 w-3.5 ${
                  activeTab === "tools" ? "text-cyan-400" : ""
                }`}
              />
              <span>Tools & Integrations</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="transition-all">
            {activeTab === "business" && (
              <BusinessDetailsTab config={config} onChange={handleConfigChange} />
            )}

            {activeTab === "prompt" && (
              <SystemPromptTab config={config} onChange={handleConfigChange} />
            )}

            {activeTab === "voice" && (
              <VoiceSettingsTab config={config} onChange={handleConfigChange} />
            )}

            {activeTab === "tools" && (
              <ToolsTab config={config} onChange={handleConfigChange} />
            )}
          </div>
        </div>

        {/* Right Column: Docked Live Test Call Simulator */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <LiveTestWidget config={config} />

            {/* Quick Testing Tips Card */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm text-xs">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Live Audio Testing Tips
              </h4>
              <ul className="mt-2.5 space-y-2 text-zinc-400 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>
                    The simulator reads your configured <strong>Greeting Message</strong> and adapts dynamically to your <strong>System Prompt</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>
                    Test real speech synthesis with Rachel or Guy by turning on your speaker.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>
                    Speak into your mic or try clicking the quick questions to simulate real patient or customer calls.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Test Call trigger on bottom right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsFloatingCallOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-cyan-500/30 ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-cyan-500/50"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <PhoneCall className="h-4 w-4" />
          <span>Test Call ({currentVoice.name})</span>
        </button>
      </div>

      {/* Floating Live Test Modal / Drawer */}
      <LiveTestWidget
        config={config}
        isFloating={true}
        isOpenFloating={isFloatingCallOpen}
        onCloseFloating={() => setIsFloatingCallOpen(false)}
      />
    </div>
  );
}
