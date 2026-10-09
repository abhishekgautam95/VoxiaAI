"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  Clock,
  Play,
  Pause,
  X,
  ChevronDown,
  Sparkles,
  User,
  Bot,
  Volume2,
  PhoneCall,
  Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CallStatus = "Completed" | "Missed" | "Appointment Booked";

interface TranscriptMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

interface CallRecord {
  id: string;
  callId: string;
  dateTime: string;
  date: string;
  time: string;
  duration: string;
  callerNumber: string;
  status: CallStatus;
  aiSummary: string;
  keyTakeaways: string[];
  transcript: TranscriptMessage[];
  audioDurationSec: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockCalls: CallRecord[] = [
  {
    id: "1",
    callId: "CALL-9021",
    dateTime: "2024-10-09T10:32:00",
    date: "Oct 9, 2024",
    time: "10:32 AM",
    duration: "2m 14s",
    callerNumber: "+1 (415) 329-8812",
    status: "Appointment Booked",
    aiSummary:
      "Caller requested a routine dental cleaning appointment. AI receptionist checked availability, confirmed insurance coverage (Delta Dental PPO), and booked Tuesday Oct 14 at 10:30 AM with Dr. Smith.",
    keyTakeaways: [
      "Appointment booked: Tue Oct 14, 10:30 AM with Dr. Smith",
      "Insurance verified: Delta Dental PPO — in-network",
      "Patient prefers morning slots for future bookings",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good morning! Thank you for calling Apex Health & Dental. This is Sarah, your AI receptionist. How can I help you today?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi, I'd like to book a dental cleaning appointment please.", timestamp: "0:05" },
      { id: "t3", role: "ai", text: "I'd be happy to help you schedule a cleaning! May I have your name and the best phone number to reach you?", timestamp: "0:09" },
      { id: "t4", role: "user", text: "Sure, it's Eleanor Vance, and this number is fine.", timestamp: "0:14" },
      { id: "t5", role: "ai", text: "Thank you, Eleanor! Do you have a preferred day and time? I have availability next Tuesday morning at 10:30 AM with Dr. Smith.", timestamp: "0:18" },
      { id: "t6", role: "user", text: "Tuesday at 10:30 works perfectly!", timestamp: "0:28" },
      { id: "t7", role: "ai", text: "Wonderful! Before I confirm, could you let me know your insurance provider?", timestamp: "0:32" },
      { id: "t8", role: "user", text: "I have Delta Dental PPO.", timestamp: "0:37" },
      { id: "t9", role: "ai", text: "Great news — Delta Dental PPO is in our network! I've booked your cleaning for Tuesday, October 14th at 10:30 AM with Dr. Smith. You'll receive a confirmation text shortly. Is there anything else I can help with?", timestamp: "0:40" },
      { id: "t10", role: "user", text: "No, that's all. Thank you so much!", timestamp: "0:55" },
      { id: "t11", role: "ai", text: "You're welcome, Eleanor! Have a wonderful day. Goodbye!", timestamp: "0:59" },
    ],
    audioDurationSec: 134,
  },
  {
    id: "2",
    callId: "CALL-9020",
    dateTime: "2024-10-09T10:18:00",
    date: "Oct 9, 2024",
    time: "10:18 AM",
    duration: "1m 45s",
    callerNumber: "+1 (510) 902-1144",
    status: "Completed",
    aiSummary:
      "Caller inquired about insurance network compatibility. AI receptionist confirmed Delta Dental PPO is accepted and provided office hours and website link for further details.",
    keyTakeaways: [
      "Inquiry resolved: Delta Dental PPO accepted",
      "Provided office hours: Mon–Fri 8 AM – 6 PM",
      "No follow-up action required",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good morning! Apex Health & Dental, Sarah speaking. How may I assist you?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi, I wanted to check if you accept Delta Dental PPO insurance?", timestamp: "0:04" },
      { id: "t3", role: "ai", text: "Yes, we do accept Delta Dental PPO! We're an in-network provider. Would you like to schedule an appointment?", timestamp: "0:09" },
      { id: "t4", role: "user", text: "Not right now, I just needed to confirm. What are your office hours?", timestamp: "0:16" },
      { id: "t5", role: "ai", text: "Of course! Our office hours are Monday through Friday, 8 AM to 6 PM. You can also visit our website for more details. Is there anything else?", timestamp: "0:21" },
      { id: "t6", role: "user", text: "That's all I needed. Thanks!", timestamp: "0:32" },
      { id: "t7", role: "ai", text: "Happy to help! Feel free to call anytime when you're ready to book. Have a great day!", timestamp: "0:35" },
    ],
    audioDurationSec: 105,
  },
  {
    id: "3",
    callId: "CALL-9019",
    dateTime: "2024-10-09T10:04:00",
    date: "Oct 9, 2024",
    time: "10:04 AM",
    duration: "0m 12s",
    callerNumber: "+1 (408) 773-4521",
    status: "Missed",
    aiSummary:
      "Caller disconnected before the AI receptionist could respond. No voicemail was left. The system logged the incoming number for callback follow-up.",
    keyTakeaways: [
      "Call disconnected after 12 seconds",
      "No voicemail recorded",
      "Number flagged for callback queue",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good morning! Thank you for calling Apex Health & Dental. This is Sarah—", timestamp: "0:00" },
      { id: "t2", role: "user", text: "[Call disconnected]", timestamp: "0:12" },
    ],
    audioDurationSec: 12,
  },
  {
    id: "4",
    callId: "CALL-9018",
    dateTime: "2024-10-09T09:31:00",
    date: "Oct 9, 2024",
    time: "9:31 AM",
    duration: "3m 05s",
    callerNumber: "+1 (650) 412-8903",
    status: "Appointment Booked",
    aiSummary:
      "Existing patient called to reschedule a root canal consultation. AI receptionist found an available slot on Friday Oct 17 at 2 PM, confirmed with the patient, and updated the calendar.",
    keyTakeaways: [
      "Rescheduled: Root canal consultation → Fri Oct 17, 2:00 PM",
      "Previous appointment on Oct 10 cancelled",
      "Patient requested a reminder call the day before",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good morning! Apex Health & Dental, Sarah here. How can I help you?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi Sarah, this is David Chen. I need to reschedule my root canal consultation that's on this Thursday.", timestamp: "0:04" },
      { id: "t3", role: "ai", text: "Of course, David! Let me pull up your appointment. I see it's scheduled for Thursday, October 10th. When would work better for you?", timestamp: "0:12" },
      { id: "t4", role: "user", text: "Can you do sometime next Friday, in the afternoon?", timestamp: "0:22" },
      { id: "t5", role: "ai", text: "Let me check... I have Friday, October 17th at 2:00 PM available. Would that work?", timestamp: "0:27" },
      { id: "t6", role: "user", text: "That's perfect. And can you send me a reminder the day before?", timestamp: "0:36" },
      { id: "t7", role: "ai", text: "Absolutely! I've rescheduled your root canal consultation to Friday, October 17th at 2:00 PM, and I've added a reminder call for Thursday the 16th. Your previous appointment on October 10th has been cancelled. Is there anything else?", timestamp: "0:40" },
      { id: "t8", role: "user", text: "No, that's great. Thank you, Sarah.", timestamp: "1:02" },
      { id: "t9", role: "ai", text: "You're welcome, David! Take care and we'll see you on the 17th. Goodbye!", timestamp: "1:06" },
    ],
    audioDurationSec: 185,
  },
  {
    id: "5",
    callId: "CALL-9017",
    dateTime: "2024-10-09T09:15:00",
    date: "Oct 9, 2024",
    time: "9:15 AM",
    duration: "1m 58s",
    callerNumber: "+1 (925) 661-3347",
    status: "Completed",
    aiSummary:
      "Caller asked about teeth whitening services and pricing. AI receptionist provided details on in-office Zoom whitening ($450) and take-home kit ($250), and offered to schedule a consultation.",
    keyTakeaways: [
      "Service inquiry: Teeth whitening options",
      "Pricing shared: In-office $450, Take-home $250",
      "Caller will call back to book consultation",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good morning! Apex Health & Dental, this is Sarah. How can I assist you today?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi, I'm interested in teeth whitening. What options do you offer?", timestamp: "0:05" },
      { id: "t3", role: "ai", text: "Great question! We offer two whitening options. Our in-office Zoom whitening treatment is $450 and takes about an hour. We also have a professional take-home whitening kit for $250, which includes custom trays.", timestamp: "0:10" },
      { id: "t4", role: "user", text: "How long do the results last with the in-office treatment?", timestamp: "0:25" },
      { id: "t5", role: "ai", text: "With proper care, results from our Zoom whitening typically last 12 to 18 months. We also recommend occasional touch-ups with the take-home kit to maintain your results.", timestamp: "0:30" },
      { id: "t6", role: "user", text: "Okay, let me think about it and I'll call back to schedule.", timestamp: "0:42" },
      { id: "t7", role: "ai", text: "Absolutely, take your time! When you're ready, we'd love to set up a quick consultation so Dr. Smith can recommend the best option for you. Have a wonderful day!", timestamp: "0:46" },
    ],
    audioDurationSec: 118,
  },
  {
    id: "6",
    callId: "CALL-9016",
    dateTime: "2024-10-08T16:42:00",
    date: "Oct 8, 2024",
    time: "4:42 PM",
    duration: "0m 08s",
    callerNumber: "+1 (628) 555-0173",
    status: "Missed",
    aiSummary:
      "Short ring with immediate disconnect. Likely a robocall or accidental dial. No interaction occurred.",
    keyTakeaways: [
      "No conversation — immediate disconnect",
      "Possible robocall or misdial",
      "No action needed",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good afternoon! Thank you for calling—", timestamp: "0:00" },
      { id: "t2", role: "user", text: "[Call disconnected]", timestamp: "0:08" },
    ],
    audioDurationSec: 8,
  },
  {
    id: "7",
    callId: "CALL-9015",
    dateTime: "2024-10-08T15:20:00",
    date: "Oct 8, 2024",
    time: "3:20 PM",
    duration: "2m 48s",
    callerNumber: "+1 (415) 678-9034",
    status: "Appointment Booked",
    aiSummary:
      "New patient called to schedule a first visit and full dental exam. Booked for Monday Oct 14 at 9:00 AM. Patient was advised to arrive 15 minutes early to complete new patient forms.",
    keyTakeaways: [
      "New patient registration: First visit scheduled",
      "Appointment: Mon Oct 14, 9:00 AM — Full exam",
      "Advised: Arrive 15 min early for paperwork",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good afternoon! Apex Health & Dental, Sarah speaking. How can I help?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi, I'm a new patient and I'd like to schedule my first dental exam.", timestamp: "0:04" },
      { id: "t3", role: "ai", text: "Welcome! We'd love to get you set up. Can I have your full name and date of birth?", timestamp: "0:10" },
      { id: "t4", role: "user", text: "Maria Rodriguez, born March 15, 1990.", timestamp: "0:15" },
      { id: "t5", role: "ai", text: "Thank you, Maria! For new patient exams, I have Monday, October 14th at 9:00 AM available. That appointment includes a full exam, X-rays, and a consultation with Dr. Smith. Would that work?", timestamp: "0:20" },
      { id: "t6", role: "user", text: "Yes, 9 AM Monday works great.", timestamp: "0:35" },
      { id: "t7", role: "ai", text: "You're all set for Monday, October 14th at 9:00 AM! Please arrive 15 minutes early to fill out your new patient forms. We'll also send you a link to complete them online beforehand. Anything else I can help with?", timestamp: "0:39" },
      { id: "t8", role: "user", text: "Nope, that's it. Thanks!", timestamp: "0:58" },
      { id: "t9", role: "ai", text: "Wonderful! We look forward to seeing you, Maria. Have a great day!", timestamp: "1:01" },
    ],
    audioDurationSec: 168,
  },
  {
    id: "8",
    callId: "CALL-9014",
    dateTime: "2024-10-08T14:05:00",
    date: "Oct 8, 2024",
    time: "2:05 PM",
    duration: "1m 32s",
    callerNumber: "+1 (510) 444-2178",
    status: "Completed",
    aiSummary:
      "Caller asked about parking availability and directions to the clinic. AI receptionist provided the address, free parking lot details, and nearby landmark directions.",
    keyTakeaways: [
      "Directions provided to clinic location",
      "Free parking lot behind the building confirmed",
      "No appointment or follow-up needed",
    ],
    transcript: [
      { id: "t1", role: "ai", text: "Good afternoon! Apex Health & Dental, this is Sarah. How can I help?", timestamp: "0:00" },
      { id: "t2", role: "user", text: "Hi, I have an appointment later today and I'm not sure where to park. Do you have parking?", timestamp: "0:04" },
      { id: "t3", role: "ai", text: "Yes! We have a free parking lot right behind our building. Our address is 1200 Market Street, Suite 300. The parking entrance is off Pine Avenue. Look for the blue Apex Health sign.", timestamp: "0:10" },
      { id: "t4", role: "user", text: "Great, and is it easy to find from the highway?", timestamp: "0:24" },
      { id: "t5", role: "ai", text: "Very easy! Take Exit 12B from Highway 101, turn right on Market Street, and we're about half a mile on the left. You'll see the building right after the Starbucks on the corner.", timestamp: "0:28" },
      { id: "t6", role: "user", text: "Perfect, thanks Sarah!", timestamp: "0:40" },
      { id: "t7", role: "ai", text: "You're welcome! See you soon. Drive safe!", timestamp: "0:43" },
    ],
    audioDurationSec: 92,
  },
];

const statusOptions: CallStatus[] = [
  "Completed",
  "Missed",
  "Appointment Booked",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusBadgeStyles: Record<CallStatus, string> = {
  Completed:
    "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50",
  Missed:
    "bg-rose-950/70 text-rose-400 border border-rose-800/50",
  "Appointment Booked":
    "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50",
};

function formatPlaybackTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Audio Player Component ─────────────────────────────────────────────────

interface AudioPlayerProps {
  totalDurationSec: number;
}

function AudioPlayer({ totalDurationSec }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speeds = [0.5, 1, 1.5, 2];

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDurationSec]);

  const progress =
    totalDurationSec > 0
      ? Math.min((currentTime / totalDurationSec) * 100, 100)
      : 0;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Progress */}
        <div className="flex-1 space-y-1">
          <div
            className="relative h-1.5 w-full cursor-pointer rounded-full bg-zinc-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pct * totalDurationSec);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-cyan-500 shadow-sm transition-all duration-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>{formatPlaybackTime(currentTime)}</span>
            <span>{formatPlaybackTime(totalDurationSec)}</span>
          </div>
        </div>

        {/* Volume Icon */}
        <Volume2 className="h-4 w-4 shrink-0 text-zinc-500" />

        {/* Playback Speed */}
        <button
          type="button"
          onClick={() => {
            const idx = speeds.indexOf(playbackSpeed);
            setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
          }}
          className="shrink-0 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}

// ─── Transcript Drawer ──────────────────────────────────────────────────────

interface TranscriptDrawerProps {
  call: CallRecord;
  onClose: () => void;
}

function TranscriptDrawer({ call, onClose }: TranscriptDrawerProps) {
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
        className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Call Transcript"
      >
        {/* ── Drawer Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                {call.callId}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusBadgeStyles[call.status]}`}
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close transcript"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Summary & Key Takeaways */}
          <div className="border-b border-zinc-800/70 px-5 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                AI Summary
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              {call.aiSummary}
            </p>

            {/* Key Takeaways */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
          <div className="border-b border-zinc-800/70 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-zinc-100">
                Call Recording
              </h3>
            </div>
            <AudioPlayer totalDurationSec={call.audioDurationSec} />
          </div>

          {/* Transcript Chat Bubbles */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-4">
              <PhoneCall className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-100">
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
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-sm">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                      msg.role === "user"
                        ? "bg-cyan-600/20 border border-cyan-500/20 text-zinc-100"
                        : "bg-zinc-800/70 border border-zinc-700/50 text-zinc-200"
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <p
                      className={`mt-1 text-[10px] font-mono ${
                        msg.role === "user"
                          ? "text-cyan-400/60"
                          : "text-zinc-500"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>

                  {/* User Avatar (right side) */}
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
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

// ─── Status Filter Dropdown ──────────────────────────────────────────────────

interface StatusFilterProps {
  selected: CallStatus | "All";
  onChange: (status: CallStatus | "All") => void;
}

function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        <Filter className="h-3.5 w-3.5 text-zinc-500" />
        <span>{selected === "All" ? "All Statuses" : selected}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 z-20">
          <button
            type="button"
            onClick={() => { onChange("All"); setOpen(false); }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
              selected === "All"
                ? "bg-zinc-800/80 text-white"
                : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
            }`}
          >
            All Statuses
            {selected === "All" && <Check className="h-3.5 w-3.5 text-cyan-400" />}
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { onChange(status); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                selected === status
                  ? "bg-zinc-800/80 text-white"
                  : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
              }`}
            >
              {status}
              {selected === status && <Check className="h-3.5 w-3.5 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function CallLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatus | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Filtered calls
  const filteredCalls = mockCalls.filter((call) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesPhone = call.callerNumber.toLowerCase().includes(q);
      const matchesId = call.callId.toLowerCase().includes(q);
      if (!matchesPhone && !matchesId) return false;
    }

    // Status filter
    if (statusFilter !== "All" && call.status !== statusFilter) return false;

    // Date range filter
    if (dateFrom) {
      const callDate = new Date(call.dateTime);
      const from = new Date(dateFrom);
      if (callDate < from) return false;
    }
    if (dateTo) {
      const callDate = new Date(call.dateTime);
      const to = new Date(dateTo + "T23:59:59");
      if (callDate > to) return false;
    }

    return true;
  });

  return (
    <>
      <div className="space-y-6">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Call Logs & Transcripts
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Audit recordings, sentiment analysis, and conversational traces for all inbound calls.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* ── Search & Filter Bar ──────────────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone number or call ID..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date From */}
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 focus:border-cyan-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                title="From date"
              />
            </div>

            <span className="text-xs text-zinc-500">to</span>

            {/* Date To */}
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 focus:border-cyan-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                title="To date"
              />
            </div>

            {/* Status Filter */}
            <StatusFilter
              selected={statusFilter}
              onChange={setStatusFilter}
            />

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "All" || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 py-2 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Call Logs Table ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-900/60">
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Call ID
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Date / Time
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Duration
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Caller Number
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-right">
                    Recording
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredCalls.length > 0 ? (
                  filteredCalls.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="group cursor-pointer transition-colors hover:bg-zinc-800/30"
                    >
                      {/* Call ID */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-mono text-xs font-medium text-cyan-400">
                          {call.callId}
                        </span>
                      </td>

                      {/* Date / Time */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="text-xs text-zinc-200">
                          {call.date}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {call.time}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          {call.duration}
                        </span>
                      </td>

                      {/* Caller Number */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                            <Phone className="h-2.5 w-2.5" />
                          </div>
                          <span className="font-mono text-xs text-zinc-200">
                            {call.callerNumber}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusBadgeStyles[call.status]}`}
                        >
                          {call.status}
                        </span>
                      </td>

                      {/* Audio Button */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCall(call);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-850 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-zinc-800/80"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Play</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-500">
                        <PhoneCall className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-zinc-300">
                        No calls found
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Count */}
          <div className="flex items-center justify-between border-t border-zinc-800/60 px-5 py-3 bg-zinc-900/30">
            <span className="text-[11px] text-zinc-500">
              Showing {filteredCalls.length} of {mockCalls.length} calls
            </span>
            <span className="text-[11px] text-zinc-500">
              Click any row to view transcript
            </span>
          </div>
        </div>
      </div>

      {/* ── Transcript Drawer (Slide-over) ──────────────────────────── */}
      {selectedCall && (
        <TranscriptDrawer
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </>
  );
}
