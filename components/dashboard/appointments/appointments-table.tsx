"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Phone,
  Calendar,
  Clock,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Bot,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "./types";

interface AppointmentsTableProps {
  appointments: Appointment[];
  onRescheduleClick: (apt: Appointment) => void;
  onCancelClick: (aptId: string) => void;
  onCompleteClick: (aptId: string) => void;
}

export function AppointmentsTable({
  appointments,
  onRescheduleClick,
  onCancelClick,
  onCompleteClick,
}: AppointmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AppointmentStatus>("All");

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery) ||
      apt.serviceRequested.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs">
          <span className="px-2 text-[11px] text-zinc-400 flex items-center gap-1">
            <Filter className="h-3 w-3 text-cyan-400" /> Status:
          </span>
          {(["All", "Confirmed", "Completed", "Cancelled"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Phone Number</th>
                <th className="px-4 py-3.5">Service Requested</th>
                <th className="px-4 py-3.5">Booking Date & Time</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-2">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-300">
                        No appointments found
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Try modifying your search or changing the status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isCancelled = apt.status === "Cancelled";
                  const isCompleted = apt.status === "Completed";

                  return (
                    <tr
                      key={apt.id}
                      className="group transition-colors hover:bg-zinc-900/50"
                    >
                      {/* Customer Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                            {apt.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {apt.customerName}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <span>{apt.provider}</span>
                              {apt.bookedBy === "AI Voice Agent" && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 px-1 py-0.2 text-[9px] font-medium text-cyan-300">
                                  <Bot className="h-2.5 w-2.5" /> AI Booked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-cyan-400" />
                          <span>{apt.phone}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[140px] mt-0.5">
                          {apt.email}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-zinc-200">
                          {apt.serviceRequested}
                        </div>
                        {apt.notes && (
                          <div className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs mt-0.5" title={apt.notes}>
                            {apt.notes}
                          </div>
                        )}
                      </td>

                      {/* Booking Time */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-zinc-200 font-medium">
                          <Calendar className="h-3 w-3 text-cyan-400" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <Clock className="h-3 w-3 text-indigo-400" />
                          <span>{apt.time} ({apt.durationMinutes} min)</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(apt.status)}
                      </td>

                      {/* Quick Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reschedule Button */}
                          <button
                            type="button"
                            onClick={() => onRescheduleClick(apt)}
                            disabled={isCancelled}
                            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-800 hover:text-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Reschedule appointment date/time"
                          >
                            <RefreshCw className="h-3 w-3 text-amber-400" />
                            <span>Reschedule</span>
                          </button>

                          {/* Cancel Button */}
                          {!isCancelled && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => onCancelClick(apt.id)}
                              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                              title="Cancel this appointment"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Complete Button */}
                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => onCompleteClick(apt.id)}
                              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/30 hover:text-cyan-300 transition-colors"
                              title="Mark appointment as completed"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="hidden sm:inline">Done</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
          <span>
            Showing <strong>{filteredAppointments.length}</strong> of{" "}
            <strong>{appointments.length}</strong> appointments
          </span>
          <span className="text-[11px] text-zinc-500">
            Real-time synchronization with AI Voice Receptionist
          </span>
        </div>
      </div>
    </div>
  );
}
