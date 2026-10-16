"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  List,
  Plus,
  Download,
  CalendarCheck,
  Clock,
  XCircle,
  TrendingUp,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Appointment, ViewMode } from "@/components/dashboard/appointments/types";
import { AppointmentsTable } from "@/components/dashboard/appointments/appointments-table";
import { CalendarView } from "@/components/dashboard/appointments/calendar-view";
import { AddAppointmentModal } from "@/components/dashboard/appointments/add-appointment-modal";
import { RescheduleModal } from "@/components/dashboard/appointments/reschedule-modal";

interface DbAppointmentRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  email?: string | null;
  service: string;
  provider?: string | null;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
  bookedBy?: string | null;
  createdAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const [todayStr, setTodayStr] = useState("2026-10-14");

  const loadAppointments = useCallback(() => {
    fetch("/api/appointments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setTodayStr(new Date().toISOString().split("T")[0]);
        if (Array.isArray(data?.appointments)) {
          const mapped: Appointment[] = data.appointments.map((dbApt: DbAppointmentRecord) => ({
            id: dbApt.id,
            customerName: dbApt.customerName,
            phone: dbApt.phoneNumber,
            email: dbApt.email || "",
            serviceRequested: dbApt.service,
            date: dbApt.date,
            time: dbApt.time,
            durationMinutes: 45,
            status:
              dbApt.status === "CONFIRMED"
                ? "Confirmed"
                : dbApt.status === "COMPLETED"
                ? "Completed"
                : "Cancelled",
            provider: dbApt.provider || "Dr. Sarah Smith",
            notes: dbApt.notes || undefined,
            bookedBy: dbApt.bookedBy?.includes("AI") ? "AI Voice Agent" : "Manual Entry",
            createdAt: new Date(dbApt.createdAt).toISOString(),
          }));
          setAppointments(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Stats Bar calculations
  const stats = useMemo(() => {
    const totalToday = appointments.filter((apt) => apt.date === todayStr).length;
    const upcomingThisWeek = appointments.filter(
      (apt) => apt.date >= todayStr && apt.status === "Confirmed"
    ).length;
    const cancelledCount = appointments.filter(
      (apt) => apt.status === "Cancelled"
    ).length;
    const completedCount = appointments.filter(
      (apt) => apt.status === "Completed"
    ).length;

    return {
      totalToday,
      upcomingThisWeek,
      cancelledCount,
      completedCount,
    };
  }, [appointments, todayStr]);

  // Handler: Add Appointment
  const handleAddAppointment = async (newApt: Appointment) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newApt.customerName,
          phoneNumber: newApt.phone,
          email: newApt.email || undefined,
          service: newApt.serviceRequested,
          provider: newApt.provider,
          date: newApt.date,
          time: newApt.time,
          notes: newApt.notes,
          bookedBy: "Staff Entry",
        }),
      });

      if (res.ok) {
        await loadAppointments();
        showToast(`Appointment confirmed for ${newApt.customerName} on ${newApt.date} at ${newApt.time}!`);
      } else {
        const err = await res.json();
        showToast(`Failed: ${err.error || "Could not save appointment"}`);
      }
    } catch {
      showToast("Error connecting to server.");
    }
  };

  // Handler: Cancel Appointment
  const handleCancelAppointment = async (aptId: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === aptId ? { ...apt, status: "Cancelled" as const } : apt
          )
        );
        showToast("Appointment status updated to Cancelled.");
      }
    } catch {
      showToast("Failed to cancel appointment.");
    }
  };

  // Handler: Mark Completed
  const handleCompleteAppointment = async (aptId: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === aptId ? { ...apt, status: "Completed" as const } : apt
          )
        );
        showToast("Appointment marked as Completed.");
      }
    } catch {
      showToast("Failed to complete appointment.");
    }
  };

  // Handler: Reschedule Appointment
  const handleRescheduleAppointment = async (
    aptId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          status: "CONFIRMED",
          reason,
        }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => {
            if (apt.id === aptId) {
              return {
                ...apt,
                date: newDate,
                time: newTime,
                status: "Confirmed" as const,
                notes: reason ? `${apt.notes || ""} [Rescheduled: ${reason}]` : apt.notes,
              };
            }
            return apt;
          })
        );
        showToast(`Appointment rescheduled to ${newDate} at ${newTime}.`);
      }
    } catch {
      showToast("Failed to reschedule appointment.");
    }
  };

  // Handler: Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Phone",
      "Email",
      "Service Requested",
      "Booking Date",
      "Booking Time",
      "Duration (Minutes)",
      "Status",
      "Provider",
      "Booked By",
      "Notes",
    ];

    const rows = appointments.map((apt) => [
      `"${apt.id}"`,
      `"${apt.customerName}"`,
      `"${apt.phone}"`,
      `"${apt.email}"`,
      `"${apt.serviceRequested}"`,
      `"${apt.date}"`,
      `"${apt.time}"`,
      apt.durationMinutes,
      `"${apt.status}"`,
      `"${apt.provider}"`,
      `"${apt.bookedBy}"`,
      `"${(apt.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voxia-appointments-2026-10-10.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Appointments exported successfully to CSV!");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-zinc-950/95 px-4 py-3 text-xs text-cyan-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Calendar & Visit Management
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
            Appointments & Schedule
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Appointments scheduled directly by your AI voice receptionist and clinical team.
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle between List View and Calendar View */}
          <div className="flex items-center rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
                viewMode === "list"
                  ? "border-cyan-500/30 bg-zinc-900 text-white shadow-md shadow-cyan-500/10"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
                viewMode === "calendar"
                  ? "border-cyan-500/30 bg-zinc-900 text-white shadow-md shadow-cyan-500/10"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-300 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            title="Download all appointments as CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export to CSV</span>
          </button>

          {/* Manual 'Add Appointment' Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Stats Bar at Top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/30 hover:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Total Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {stats.totalToday}
            </span>
            <span className="text-xs text-zinc-400">scheduled</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span>Live Cal.com / Google Calendar sync</span>
          </div>
        </div>

        {/* Upcoming This Week */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/30 hover:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Upcoming This Week</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {stats.upcomingThisWeek}
            </span>
            <span className="text-xs text-zinc-400">active visits</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-400">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>Across 4 providers & clinics</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-rose-500/30 hover:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Cancelled</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-rose-400">
              {stats.cancelledCount}
            </span>
            <span className="text-xs text-zinc-400">total</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <span>Automated reschedule links dispatched</span>
          </div>
        </div>

        {/* Completed / Total Ratio */}
        <div className="hidden lg:block rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/30 hover:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">AI Voice Booking Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              86%
            </span>
            <span className="text-xs text-zinc-400">autonomous</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>12 booked via inbound voice</span>
          </div>
        </div>
      </div>

      {/* Content Section: List View or Calendar View */}
      {viewMode === "list" ? (
        <AppointmentsTable
          appointments={appointments}
          onRescheduleClick={(apt) => setRescheduleTarget(apt)}
          onCancelClick={handleCancelAppointment}
          onCompleteClick={handleCompleteAppointment}
        />
      ) : (
        <CalendarView
          appointments={appointments}
          onRescheduleClick={(apt) => setRescheduleTarget(apt)}
          onCancelClick={handleCancelAppointment}
          onCompleteClick={handleCompleteAppointment}
        />
      )}

      {/* Manual 'Add Appointment' Modal/Dialog */}
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAppointment}
      />

      {/* Quick Action Reschedule Modal */}
      <RescheduleModal
        appointment={rescheduleTarget}
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        onReschedule={handleRescheduleAppointment}
      />
    </div>
  );
}
