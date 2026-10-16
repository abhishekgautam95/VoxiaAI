"use client";

import React, { useRef, useEffect } from "react";
import { X, Sparkles, Check, Volume2, PhoneCall, Bot, User } from "lucide-react";
import { CallRecord, statusBadgeStyles } from "./types";
import { AudioPlayer } from "./audio-player";

interface TranscriptDrawerProps {
  call: CallRecord;
  onClose: () => void;
}

export function TranscriptDrawer({ call, onClose }: TranscriptDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-zinc-800/80 bg-zinc-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Call Transcript"
      >
        {/* ── Drawer Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-white">
                {call.callId}
              </h2>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusBadgeStyles[call.status]}`}
              >
                {call.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              {call.date} at {call.time} · {call.duration} · {call.callerNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-cyan-500/30 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            aria-label="Close transcript"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Summary & Key Takeaways */}
          <div className="border-b border-zinc-800/80 px-5 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-zinc-100">
                AI Summary
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              {call.aiSummary}
            </p>

            {/* Key Takeaways */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Key Takeaways
              </span>
              <ul className="space-y-1">
                {call.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audio Player */}
          <div className="border-b border-zinc-800/80 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold tracking-wide text-zinc-100">
                Call Recording
              </h3>
            </div>
            <AudioPlayer totalDurationSec={call.audioDurationSec} />
          </div>

          {/* Transcript Chat Bubbles */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-4">
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold tracking-wide text-zinc-100">
                Full Transcript
              </h3>
            </div>

            <div className="space-y-3">
              {call.transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar (left side) */}
                  {msg.role === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-sm ring-1 ring-zinc-700">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-lg px-3.5 py-2.5 ${
                      msg.role === "user"
                        ? "bg-cyan-950/40 border border-cyan-500/30 text-zinc-100"
                        : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-200"
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <p
                      className={`mt-1 text-[10px] font-mono ${
                        msg.role === "user"
                          ? "text-cyan-400/70"
                          : "text-zinc-500"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>

                  {/* User Avatar (right side) */}
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800/80 text-zinc-300">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
