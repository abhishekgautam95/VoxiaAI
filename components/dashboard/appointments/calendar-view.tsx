"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  XCircle,
  CheckCircle2,
  X,
  Bot,
} from "lucide-react";
import { Appointment } from "./types";

interface CalendarViewProps {
  appointments: Appointment[];
  onRescheduleClick: (apt: Appointment) => void;
  onCancelClick: (aptId: string) => void;
  onCompleteClick: (aptId: string) => void;
}

export function CalendarView({
  appointments,
  onRescheduleClick,
  onCancelClick,
  onCompleteClick,
}: CalendarViewProps) {
  // Center around October 2026 (matching the current date context 2026-10-10)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
  };

  // Compute days in month and starting day of week
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ dayNumber: null, dateString: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(d).padStart(2, "0");
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    calendarCells.push({ dayNumber: d, dateString });
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter((apt) => apt.date === dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <p className="text-xs text-zinc-400">
              Schedule Overview & Booking Density
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="h-4 w-px bg-zinc-800" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/60 text-center text-xs font-semibold text-zinc-400 py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-zinc-800/60">
          {calendarCells.map((cell, idx) => {
            if (!cell.dayNumber || !cell.dateString) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[110px] bg-zinc-950/40 p-2 text-zinc-700"
                />
              );
            }

            const dayApts = getAppointmentsForDate(cell.dateString);
            const isToday = cell.dateString === "2026-10-10";

            return (
              <div
                key={cell.dateString}
                className={`min-h-[120px] p-2 transition-colors ${
                  isToday
                    ? "bg-cyan-950/20 ring-1 ring-inset ring-cyan-500/30"
                    : "hover:bg-zinc-900/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-cyan-500 text-zinc-950 shadow-sm shadow-cyan-500/30"
                        : "text-zinc-300"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  {dayApts.length > 0 && (
                    <span className="text-[10px] font-medium text-zinc-400">
                      {dayApts.length} {dayApts.length === 1 ? "booking" : "bookings"}
                    </span>
                  )}
                </div>

                {/* Appointment Chips in this day */}
                <div className="space-y-1">
                  {dayApts.map((apt) => {
                    const isCancelled = apt.status === "Cancelled";
                    const isCompleted = apt.status === "Completed";

                    return (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => setSelectedAppointment(apt)}
                        className={`w-full text-left truncate rounded px-1.5 py-1 text-[10px] font-medium transition-all ${
                          isCancelled
                            ? "bg-rose-950/40 border border-rose-800/40 text-rose-300 line-through opacity-75"
                            : isCompleted
                            ? "bg-zinc-800/80 border border-zinc-700/60 text-zinc-300"
                            : "bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:border-emerald-400"
                        }`}
                        title={`${apt.time} - ${apt.customerName} (${apt.serviceRequested})`}
                      >
                        <span className="font-bold mr-1">{apt.time}</span>
                        <span>{apt.customerName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Detail Popover Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Appointment Details
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    selectedAppointment.status === "Confirmed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : selectedAppointment.status === "Completed"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-sm font-bold text-white">
                  {selectedAppointment.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedAppointment.customerName}
                  </h4>
                  <p className="text-zinc-400">{selectedAppointment.phone}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Service:</span>
                  <span className="font-semibold text-white">
                    {selectedAppointment.serviceRequested}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Date & Time:</span>
                  <span className="font-semibold text-cyan-300">
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Provider:</span>
                  <span className="text-zinc-200">
                    {selectedAppointment.provider}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Booked Via:</span>
                  <span className="text-zinc-200 flex items-center gap-1">
                    <Bot className="h-3 w-3 text-cyan-400" />
                    {selectedAppointment.bookedBy}
                  </span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-[11px] font-semibold text-zinc-400 mb-1">
                    Notes & Symptoms:
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
              {selectedAppointment.status !== "Cancelled" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const apt = selectedAppointment;
                      setSelectedAppointment(null);
                      onRescheduleClick(apt);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-zinc-800 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCancelClick(selectedAppointment.id);
                      setSelectedAppointment(null);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}

              {selectedAppointment.status === "Confirmed" && (
                <button
                  type="button"
                  onClick={() => {
                    onCompleteClick(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
