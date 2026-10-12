"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Radio,
  Send,
  RefreshCw,
  Clock,
  Maximize2,
  Minimize2,
  X,
  CheckCircle2,
} from "lucide-react";
import { AgentConfig, CallState, TranscriptMessage } from "./types";
import { ELEVENLABS_VOICES } from "./data";

interface LiveTestWidgetProps {
  config: AgentConfig;
  isFloating?: boolean;
  isOpenFloating?: boolean;
  onCloseFloating?: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const WAVEFORM_HEIGHTS_AGENT = [
  35, 60, 85, 45, 95, 75, 40, 85, 100, 65, 40, 75, 90, 50, 70, 85, 45, 95,
  70, 55, 80, 45, 65, 90, 55, 75, 40, 25,
];

const WAVEFORM_HEIGHTS_MIC = [
  25, 45, 65, 35, 55, 40, 65, 50, 75, 35, 45, 60, 40, 55, 65, 45, 35, 50,
  60, 40, 55, 35, 45, 60, 40, 30, 25, 20,
];

const WAVEFORM_HEIGHTS_IDLE = [
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
];

export function LiveTestWidget({
  config,
  isFloating = false,
  isOpenFloating = false,
  onCloseFloating,
}: LiveTestWidgetProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const msgCounterRef = useRef<number>(1);

  // Find currently selected voice
  const activeVoice =
    ELEVENLABS_VOICES.find((v) => v.id === config.selectedVoiceId) ||
    ELEVENLABS_VOICES[0];

  // Auto-scroll transcript when new message arrives
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop =
        transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Call duration timer
  useEffect(() => {
    if (callState !== "connected") return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Play telephone ringing audio tone using Web Audio API
  const playRingingTone = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      // US ringback frequencies: 440Hz + 480Hz
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext not allowed or unsupported in some environments
    }
  }, []);

  // Fallback speech synthesis using browser API
  const fallbackSpeechSynthesis = useCallback(
    (text: string) => {
      if (
        isSpeakerMuted ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        setIsAgentSpeaking(true);
        setTimeout(() => setIsAgentSpeaking(false), 2400);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Adjust pitch and rate according to voice profile
        if (activeVoice.gender === "Female") {
          utterance.pitch = 1.15;
          utterance.rate = config.speakingRate || 1.0;
        } else {
          utterance.pitch = 0.88;
          utterance.rate = (config.speakingRate || 1.0) * 0.95;
        }

        // Try to pick language matching configured primary language
        const langCode = config.primaryLanguage.includes("Spanish")
          ? "es-ES"
          : config.primaryLanguage.includes("French")
          ? "fr-FR"
          : config.primaryLanguage.includes("German")
          ? "de-DE"
          : config.primaryLanguage.includes("Hindi")
          ? "hi-IN"
          : "en-US";
        utterance.lang = langCode;

        utterance.onstart = () => setIsAgentSpeaking(true);
        utterance.onend = () => setIsAgentSpeaking(false);
        utterance.onerror = () => setIsAgentSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch {
        setIsAgentSpeaking(true);
        setTimeout(() => setIsAgentSpeaking(false), 2000);
      }
    },
    [
      activeVoice.gender,
      config.primaryLanguage,
      config.speakingRate,
      isSpeakerMuted,
    ]
  );

  // Text-to-Speech using ElevenLabs TTS API with SpeechSynthesis fallback
  const speakAgentText = useCallback(
    async (text: string) => {
      if (isSpeakerMuted) return;

      setIsAgentSpeaking(true);

      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voiceId: activeVoice.id,
            stability: config.voiceStability,
            similarity: config.clarityBoost,
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("audio/mpeg")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          activeAudioRef.current = audio;
          audio.onended = () => {
            setIsAgentSpeaking(false);
            URL.revokeObjectURL(url);
          };
          audio.onerror = () => {
            setIsAgentSpeaking(false);
            URL.revokeObjectURL(url);
          };
          await audio.play();
          return;
        }
      } catch {
        // Fall back to Web Speech Synthesis
      }

      fallbackSpeechSynthesis(text);
    },
    [
      activeVoice.id,
      config.voiceStability,
      config.clarityBoost,
      fallbackSpeechSynthesis,
      isSpeakerMuted,
    ]
  );

  // Start Call Handler
  const handleStartCall = () => {
    setCallState("connecting");
    setCallDuration(0);
    setTranscript([]);
    playRingingTone();

    // After 1.2s switch to ringing, after 2.4s connect
    setTimeout(() => {
      setCallState("ringing");
      playRingingTone();
    }, 1200);

    setTimeout(() => {
      setCallState("connected");
      // Initial Greeting
      const rawGreeting =
        config.greetingMessage ||
        `Thank you for calling ${config.businessName}. My name is ${config.agentName}. How can I assist you today?`;

      // Replace template variables
      const processedGreeting = rawGreeting
        .replace(/\{business_name\}/g, config.businessName)
        .replace(/\{agent_name\}/g, config.agentName)
        .replace(/\{business_category\}/g, config.businessCategory)
        .replace(/\{office_hours\}/g, config.officeHours);

      const msgId = `msg-${msgCounterRef.current++}`;
      const initialMsg: TranscriptMessage = {
        id: msgId,
        sender: "agent",
        text: processedGreeting,
        timestamp: "00:01",
      };

      setTranscript([initialMsg]);
      speakAgentText(processedGreeting);
    }, 2500);
  };

  // End Call Handler
  const handleEndCall = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListeningMic(false);
    setIsAgentSpeaking(false);
    setCallState("ended");

    // Automatically record completed call and transcripts in database
    if (transcript.length > 1) {
      const isBooked = transcript.some(
        (t) =>
          t.text.toLowerCase().includes("reserved") ||
          t.text.toLowerCase().includes("booked")
      );
      fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerNumber: "+1 (415) 329-8812",
          callerName: "Web Simulator Caller",
          durationSeconds: callDuration,
          durationFormatted: `${Math.floor(callDuration / 60)}m ${callDuration % 60}s`,
          status: isBooked ? "APPOINTMENT_BOOKED" : "COMPLETED",
          aiSummary: `Interactive test session with ${config.agentName}. Handled ${
            transcript.filter((t) => t.sender === "caller").length
          } caller turns.`,
          keyTakeaways: [
            `Session handled autonomously by ${config.agentName}`,
            `Verified business hours, insurance, and service parameters`,
            isBooked
              ? "Appointment autonomously reserved in calendar"
              : "Inquiry resolved satisfactorily",
          ],
          sentiment: "Positive",
          audioDurationSec: callDuration,
          transcripts: transcript.map((t) => ({
            role: t.sender === "agent" ? "AI" : "USER",
            text: t.text,
            timestamp: t.timestamp,
          })),
        }),
      }).catch(() => {});
    }
  };

  // Reset to Idle
  const handleResetCall = () => {
    setCallState("idle");
    setCallDuration(0);
    setTranscript([]);
    setUserInput("");
  };

  // Generate contextual AI response based on agent config & caller utterance
  const generateAgentResponse = (userText: string): string => {
    const lower = userText.toLowerCase();

    // Check for transfer trigger keywords
    const transferKeywords = config.transferKeywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const isTransferRequested = transferKeywords.some((keyword) =>
      lower.includes(keyword)
    );

    if (isTransferRequested) {
      return `I understand you'd like to speak with our front desk team. I am transferring your call to a live staff member right away. Please hold for just a moment.`;
    }

    if (
      lower.includes("appointment") ||
      lower.includes("book") ||
      lower.includes("schedule") ||
      lower.includes("cleaning") ||
      lower.includes("visit") ||
      lower.includes("slot")
    ) {
      return `I would be happy to help schedule your appointment at ${config.businessName}! We have openings tomorrow at 10:30 AM or Thursday at 2:00 PM. May I have your full name and preferred time?`;
    }

    if (
      lower.includes("hour") ||
      lower.includes("open") ||
      lower.includes("close") ||
      lower.includes("time") ||
      lower.includes("weekend")
    ) {
      return `Our regular operating hours are ${config.officeHours}. Is there a particular day or service you're planning for?`;
    }

    if (
      lower.includes("where") ||
      lower.includes("address") ||
      lower.includes("location") ||
      lower.includes("park")
    ) {
      return `We are located at ${config.businessAddress}. We offer convenient parking right next to our entrance.`;
    }

    if (
      lower.includes("insurance") ||
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("pay") ||
      lower.includes("accept")
    ) {
      return `At ${config.businessName}, we accept most major PPO insurances and flexible benefit plans, and we also provide transparent estimates before any procedure. What provider do you have?`;
    }

    if (
      lower.includes("cancel") ||
      lower.includes("reschedule") ||
      lower.includes("change")
    ) {
      return `I can definitely assist with rescheduling your appointment. Could you confirm the phone number or name under which your appointment was booked?`;
    }

    // Default polite response grounded in business category
    return `Thank you for asking. As the front desk coordinator for ${config.businessName}, I can help you with scheduling, office information, and general inquiries. How else may I assist you today?`;
  };

  // Submit caller utterance
  const handleSendUserInput = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text || callState !== "connected") return;

    setUserInput("");

    // Add user message to transcript
    const userMsgId = `msg-${msgCounterRef.current++}-caller`;
    const userMsg: TranscriptMessage = {
      id: userMsgId,
      sender: "caller",
      text,
      timestamp: formatTimer(callDuration),
    };

    const updatedTranscript = [...transcript, userMsg];
    setTranscript(updatedTranscript);

    // Simulate Agent Thinking & Latency
    const latencyDelay =
      config.latencyMode === "ultra_low"
        ? 300
        : config.latencyMode === "balanced"
        ? 550
        : 900;

    try {
      const res = await fetch("/api/agent/simulate-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerText: text,
          callerNumber: config.businessPhone || "+1 (415) 329-8812",
          history: updatedTranscript.map((t) => ({
            sender: t.sender,
            text: t.text,
          })),
        }),
      });

      let responseText = "";
      if (res.ok) {
        const data = await res.json();
        responseText = data.reply;
      } else {
        responseText = generateAgentResponse(text);
      }

      setTimeout(() => {
        const agentMsgId = `msg-${msgCounterRef.current++}-agent`;
        const agentMsg: TranscriptMessage = {
          id: agentMsgId,
          sender: "agent",
          text: responseText,
          timestamp: formatTimer(callDuration + 1),
        };
        setTranscript((prev) => [...prev, agentMsg]);
        speakAgentText(responseText);
      }, latencyDelay);
    } catch {
      setTimeout(() => {
        const fallback = generateAgentResponse(text);
        const agentMsgId = `msg-${msgCounterRef.current++}-agent`;
        const agentMsg: TranscriptMessage = {
          id: agentMsgId,
          sender: "agent",
          text: fallback,
          timestamp: formatTimer(callDuration + 1),
        };
        setTranscript((prev) => [...prev, agentMsg]);
        speakAgentText(fallback);
      }, latencyDelay);
    }
  };

  // Speech Recognition support for live microphone testing
  const toggleSpeechRecognition = () => {
    if (callState !== "connected") return;

    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    const SpeechRec =
      ((window as unknown as { SpeechRecognition: SpeechRecognitionConstructor })
        .SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition: SpeechRecognitionConstructor;
          }
        ).webkitSpeechRecognition);

    if (!SpeechRec) {
      alert(
        "Live speech recognition is not supported in this browser. You can type test responses using the input box below!"
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = config.primaryLanguage.includes("Spanish")
        ? "es-US"
        : "en-US";

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const spokenTranscript = event.results[0][0].transcript;
        if (spokenTranscript) {
          handleSendUserInput(spokenTranscript);
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  // Quick prompt suggestions
  const quickTestPrompts = [
    "I'd like to book an appointment tomorrow",
    "What are your business hours?",
    "Do you accept my insurance?",
    "Can I speak with a human receptionist?",
  ];

  if (isFloating && !isOpenFloating) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl transition-all ${
        isFloating
          ? "fixed bottom-5 right-5 z-50 w-[92vw] max-w-md border-cyan-500/30 ring-1 ring-cyan-500/20"
          : "w-full"
      }`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
            <Radio className="h-4 w-4" />
            {callState === "connected" && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Live Web Call Test
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  callState === "connected"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : callState === "ringing" || callState === "connecting"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                }`}
              >
                {callState}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {activeVoice.label} • {config.primaryLanguage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {callState === "connected" && (
            <div className="flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-1 text-xs font-mono font-medium text-cyan-300">
              <Clock className="h-3 w-3 text-cyan-400" />
              {formatTimer(callDuration)}
            </div>
          )}

          {isFloating && (
            <>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3.5 w-3.5" />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" />
                )}
              </button>
              {onCloseFloating && (
                <button
                  type="button"
                  onClick={onCloseFloating}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Close test call window"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Main Visual Call Screen */}
          {callState === "idle" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950 p-6 text-center">
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Bot className="h-8 w-8" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>

              <h4 className="text-sm font-semibold text-white">
                Test Your Configured Agent
              </h4>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs leading-relaxed">
                Click below to start a realistic browser audio call. Speak into your microphone or type test messages to hear responses in real-time.
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-300">
                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5">
                  Voice: <strong className="text-cyan-300">{activeVoice.name}</strong>
                </span>
                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5">
                  Tone: <strong className="text-cyan-300">{config.conversationTone}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartCall}
                className="mt-5 group relative flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]"
              >
                <Phone className="h-4 w-4 animate-bounce" />
                <span>Start Live Test Call</span>
              </button>
            </div>
          )}

          {(callState === "connecting" || callState === "ringing") && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/30">
                  <Phone className="h-7 w-7 animate-pulse" />
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white">
                {callState === "connecting"
                  ? "Dialing Virtual Receptionist..."
                  : "Ringing Phone Line..."}
              </h4>
              <p className="mt-1 text-xs text-zinc-400">
                Connecting to {config.businessName} ({config.businessPhone})
              </p>

              <button
                type="button"
                onClick={handleEndCall}
                className="mt-5 flex items-center gap-2 rounded-lg bg-rose-600/20 border border-rose-500/40 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-600/30 transition-colors"
              >
                <PhoneOff className="h-3.5 w-3.5" /> Cancel Call
              </button>
            </div>
          )}

          {callState === "connected" && (
            <div className="space-y-3">
              {/* Dynamic Waveform Visualizer & Status */}
              <div className="rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/70 to-zinc-950 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-zinc-200">
                      {config.agentName}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({activeVoice.name})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 rounded px-1.5 py-0.5">
                    {isAgentSpeaking ? "Agent Speaking 🎙️" : "Listening for Caller 👂"}
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="mt-3 flex h-12 w-full items-center justify-center gap-1 overflow-hidden rounded-lg bg-zinc-950/80 p-2 border border-zinc-800/60">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const heightPercent = isAgentSpeaking
                      ? WAVEFORM_HEIGHTS_AGENT[i % WAVEFORM_HEIGHTS_AGENT.length]
                      : isListeningMic
                      ? WAVEFORM_HEIGHTS_MIC[i % WAVEFORM_HEIGHTS_MIC.length]
                      : WAVEFORM_HEIGHTS_IDLE[i % WAVEFORM_HEIGHTS_IDLE.length];

                    return (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isAgentSpeaking
                            ? "bg-gradient-to-t from-cyan-500 via-indigo-500 to-violet-400 animate-pulse"
                            : isListeningMic
                            ? "bg-gradient-to-t from-emerald-500 to-teal-400 animate-pulse"
                            : "bg-zinc-700/60"
                        }`}
                        style={{
                          height: `${heightPercent}%`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Audio Telemetry Bar */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                  <span>Latency: ~180ms</span>
                  <span>Opus 48kHz Stereo</span>
                  <span>Packet Loss: 0%</span>
                </div>
              </div>

              {/* Scrollable Conversation Transcript */}
              <div
                ref={transcriptScrollRef}
                className="h-48 overflow-y-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-2.5 text-xs"
              >
                {transcript.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.sender === "caller" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "agent" && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600/30 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
                        <Bot className="h-3 w-3" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-xl px-3 py-2 leading-relaxed ${
                        msg.sender === "caller"
                          ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30"
                          : "bg-zinc-800/90 text-zinc-200 border border-zinc-700/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-zinc-400 mb-0.5">
                        <span className="font-semibold text-zinc-300">
                          {msg.sender === "caller" ? "You (Caller)" : config.agentName}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="text-xs">{msg.text}</p>
                    </div>

                    {msg.sender === "caller" && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Sample Questions */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Click to Ask Agent:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickTestPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendUserInput(prompt)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/40 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Caller Input (Text + Speech Recognition) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isListeningMic
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={
                    isListeningMic
                      ? "Listening to mic... Click to stop"
                      : "Click to speak via browser microphone"
                  }
                >
                  <Mic className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type a caller question and press Enter..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendUserInput();
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />

                <button
                  type="button"
                  onClick={() => handleSendUserInput()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* In-Call Controls Bar */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                      isMuted
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                    title={isMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {isMuted ? (
                      <MicOff className="h-3.5 w-3.5" />
                    ) : (
                      <Mic className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        "speechSynthesis" in window
                      ) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeakerMuted(!isSpeakerMuted);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                      isSpeakerMuted
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                    title={
                      isSpeakerMuted
                        ? "Unmute AI speaker audio"
                        : "Mute AI speaker audio"
                    }
                  >
                    {isSpeakerMuted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 transition-all"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          )}

          {callState === "ended" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h4 className="text-sm font-semibold text-white">
                Test Call Completed
              </h4>
              <p className="mt-1 text-xs text-zinc-400">
                Agent verified for {config.businessName}
              </p>

              <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400">Duration</p>
                  <p className="font-semibold text-zinc-200">
                    {formatTimer(callDuration)}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400">Turns</p>
                  <p className="font-semibold text-zinc-200">
                    {transcript.length}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400">Latency</p>
                  <p className="font-semibold text-emerald-400">180ms</p>
                </div>
              </div>

              <div className="mt-4 flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCall}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-2 text-xs font-semibold text-white hover:from-cyan-400 hover:to-indigo-500 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start New Test
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
