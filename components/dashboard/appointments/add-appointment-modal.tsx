"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, User, Phone, Mail, Stethoscope, FileText, CheckCircle2 } from "lucide-react";
import { Appointment, AppointmentStatus } from "./types";
import { SERVICE_OPTIONS, PROVIDER_OPTIONS } from "./mock-data";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newApt: Appointment) => void;
}

export function AddAppointmentModal({
  isOpen,
  onClose,
  onAdd,
}: AddAppointmentModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceRequested, setServiceRequested] = useState(SERVICE_OPTIONS[0]);
  const [provider, setProvider] = useState(PROVIDER_OPTIONS[0]);
  const [date, setDate] = useState("2026-10-10");
  const [time, setTime] = useState("09:30 AM");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [status, setStatus] = useState<AppointmentStatus>("Confirmed");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter the customer name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a contact phone number.");
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      serviceRequested,
      date,
      time,
      durationMinutes,
      status,
      provider,
      notes: notes.trim() || "Manual phone reservation entered by front desk staff.",
      bookedBy: "Manual Entry",
      createdAt: "Just now",
    };

    onAdd(newApt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Manual Appointment Booking
              </h3>
              <p className="text-xs text-zinc-400">
                Book a direct patient visit into the clinic calendar.
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

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-cyan-400" /> Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. John Doe"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-cyan-400" /> Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                placeholder="+1 (415) 555-0199"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-cyan-400" /> Service Requested
              </label>
              <select
                value={serviceRequested}
                onChange={(e) => setServiceRequested(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
              >
                {SERVICE_OPTIONS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">
                Practitioner / Doctor
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Booking Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" /> Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
                Duration (Min)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">
              Initial Status
            </label>
            <div className="mt-1.5 flex gap-2">
              {(["Confirmed", "Completed", "Cancelled"] as AppointmentStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                      status === st
                        ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-cyan-400" /> Visit Notes / Symptoms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient called regarding tooth sensitivity on cold drinks..."
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
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
