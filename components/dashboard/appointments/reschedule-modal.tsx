"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, RefreshCw, User, Stethoscope } from "lucide-react";
import { Appointment } from "./types";

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (aptId: string, newDate: string, newTime: string, reason?: string) => void;
}

function RescheduleDialogContent({
  appointment,
  onClose,
  onReschedule,
}: {
  appointment: Appointment;
  onClose: () => void;
  onReschedule: (aptId: string, newDate: string, newTime: string, reason?: string) => void;
}) {
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReschedule(appointment.id, newDate, newTime, reason);
    onClose();
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-zinc-400">
              Move visit to a new calendar window.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Existing Appointment Info */}
      <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-cyan-400" /> {appointment.customerName}
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">{appointment.phone}</span>
        </div>
        <p className="text-zinc-400 flex items-center gap-1 text-[11px]">
          <Stethoscope className="h-3 w-3 text-cyan-400" /> {appointment.serviceRequested}
        </p>
        <p className="text-[11px] text-amber-300">
          Currently scheduled: {appointment.date} at {appointment.time}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        <div>
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Select New Date
          </label>
          <input
            type="date"
            required
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" /> Select New Time Slot
          </label>
          <select
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
          >
            {[
              "08:30 AM",
              "09:00 AM",
              "09:30 AM",
              "10:00 AM",
              "10:30 AM",
              "11:15 AM",
              "01:00 PM",
              "01:30 PM",
              "02:15 PM",
              "03:00 PM",
              "03:30 PM",
              "04:30 PM",
              "05:00 PM",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300">
            Reschedule Reason / Internal Note
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Patient requested afternoon instead of morning..."
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Confirm Reschedule</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <RescheduleDialogContent
        key={appointment.id}
        appointment={appointment}
        onClose={onClose}
        onReschedule={onReschedule}
      />
    </div>
  );
}
