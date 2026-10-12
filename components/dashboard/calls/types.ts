export type CallStatus = "Completed" | "Missed" | "Appointment Booked";

export interface TranscriptMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface CallRecord {
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

export interface DbTranscriptItem {
  id: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface DbCallItem {
  id: string;
  callId: string;
  createdAt: string;
  startedAt?: string;
  durationFormatted?: string;
  durationSeconds?: number;
  callerNumber: string;
  status: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  audioDurationSec?: number;
  transcripts?: DbTranscriptItem[];
}

export const statusOptions: CallStatus[] = [
  "Completed",
  "Missed",
  "Appointment Booked",
];

export const statusBadgeStyles: Record<CallStatus, string> = {
  Completed: "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50",
  Missed: "bg-rose-950/70 text-rose-400 border border-rose-800/50",
  "Appointment Booked": "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50",
};

export function formatPlaybackTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
