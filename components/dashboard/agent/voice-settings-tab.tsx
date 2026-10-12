"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  Pause,
  Sliders,
  Check,
  Radio,
} from "lucide-react";
import { AgentConfig, VoiceOption } from "./types";
import { ELEVENLABS_VOICES } from "./data";

interface VoiceSettingsTabProps {
  config: AgentConfig;
  onChange: (updates: Partial<AgentConfig>) => void;
}
export function VoiceSettingsTab({ config, onChange }: VoiceSettingsTabProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const fallbackSpeechSynthesis = (voice: VoiceOption) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPlayingVoiceId(voice.id);
      setTimeout(() => setPlayingVoiceId(null), 2500);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(voice.previewSampleText);

    if (voice.gender === "Female") {
      utterance.pitch = 1.15;
      utterance.rate = config.speakingRate || 1.0;
    } else {
      utterance.pitch = 0.88;
      utterance.rate = (config.speakingRate || 1.0) * 0.95;
    }

    utterance.onstart = () => setPlayingVoiceId(voice.id);
    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Play preview sample audio using ElevenLabs or SpeechSynthesis fallback
  const handlePlayVoicePreview = async (voice: VoiceOption) => {
    if (playingVoiceId === voice.id) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: voice.previewSampleText,
          voiceId: voice.id,
          stability: config.voiceStability,
          similarity: config.clarityBoost,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("audio/mpeg")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingVoiceId(null);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setPlayingVoiceId(null);
          URL.revokeObjectURL(url);
        };
        await audio.play();
        return;
      }
    } catch {
      // Ignore network errors and proceed to fallback
    }

    fallbackSpeechSynthesis(voice);
  };

  const currentVoice =
    ELEVENLABS_VOICES.find((v) => v.id === config.selectedVoiceId) ||
    ELEVENLABS_VOICES[0];

  return (
    <div className="space-y-6">
      {/* Section 1: Voice Selection Dropdown & Selected Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ElevenLabs Voice Engine Selection
              </h3>
              <p className="text-xs text-zinc-400">
                Ultra-low latency conversational AI voice models with human-level cadence and timbre.
              </p>
            </div>
          </div>
          <span className="rounded bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
            Turbo v2.5 Active
          </span>
        </div>

        {/* Quick Voice Selection Dropdown */}
        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span>Primary Voice Persona</span>
            <span className="text-[10px] text-zinc-400">
              Selected: <strong className="text-cyan-400">{currentVoice.label}</strong>
            </span>
          </label>
          <div className="mt-1.5 relative">
            <select
              value={config.selectedVoiceId}
              onChange={(e) => onChange({ selectedVoiceId: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 appearance-none cursor-pointer"
            >
              {ELEVENLABS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {v.accent} ({v.tagline})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-2.5 text-xs text-zinc-400">
              ▼
            </div>
          </div>
        </div>

        {/* Voice Library Cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {ELEVENLABS_VOICES.map((voice) => {
            const isSelected = config.selectedVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => onChange({ selectedVoiceId: voice.id })}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-500/60 bg-gradient-to-br from-cyan-950/30 to-zinc-950 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40"
                    : "border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {voice.label}
                      </span>
                      <span className="rounded bg-zinc-800 border border-zinc-700/60 px-1.5 py-0.2 text-[9px] font-medium text-zinc-300">
                        {voice.gender} • {voice.accent}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {voice.tagline}
                  </p>

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Recommended for: {voice.recommendedFor}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoicePreview(voice);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        isPlaying
                          ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30"
                          : "bg-zinc-900 border border-zinc-800 text-cyan-400 hover:bg-zinc-800 hover:text-cyan-300"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Playing Preview...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Preview Sample</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isPlaying && (
                    <div className="flex items-center gap-1">
                      <span className="h-3 w-0.5 animate-pulse rounded-full bg-cyan-400" />
                      <span className="h-4 w-0.5 animate-pulse rounded-full bg-cyan-300 delay-75" />
                      <span className="h-2 w-0.5 animate-pulse rounded-full bg-cyan-400 delay-150" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Synthesis Sliders & Fine Tuning */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Acoustic Inflection & Dynamics
            </h3>
            <p className="text-xs text-zinc-400">
              Fine-tune voice stability, similarity enhancement, and conversational tempo.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Voice Stability */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Voice Stability</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {Math.round(config.voiceStability * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.voiceStability}
              onChange={(e) =>
                onChange({ voiceStability: parseFloat(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-400 cursor-pointer"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
              <span>More Emotional</span>
              <span>More Consistent</span>
            </div>
          </div>

          {/* Clarity & Similarity Boost */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Clarity & Similarity</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {Math.round(config.clarityBoost * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.clarityBoost}
              onChange={(e) =>
                onChange({ clarityBoost: parseFloat(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-400 cursor-pointer"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Default</span>
              <span>High Clarity</span>
            </div>
          </div>

          {/* Speaking Rate */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Speaking Rate</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {config.speakingRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={config.speakingRate}
              onChange={(e) =>
                onChange({ speakingRate: parseFloat(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-400 cursor-pointer"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
              <span>0.80x (Calm)</span>
              <span>1.0x</span>
              <span>1.25x (Fast)</span>
            </div>
          </div>
        </div>

        {/* Ambient Room Simulator */}
        <div className="mt-5 border-t border-zinc-800/80 pt-4">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-400" /> Background Office Ambience Simulation
          </label>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Injects subtle room presence to make the AI voice sound identical to a receptionist sitting at a real physical desk.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { id: "none", label: "Studio Pure (No Ambience)" },
              { id: "office", label: "Quiet Office (Subtle White Noise)" },
              { id: "clinic", label: "Reception Foyer (Warm Room)" },
            ].map((amb) => (
              <button
                key={amb.id}
                type="button"
                onClick={() =>
                  onChange({ ambientNoise: amb.id as AgentConfig["ambientNoise"] })
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  config.ambientNoise === amb.id
                    ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {amb.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
