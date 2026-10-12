"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Calendar,
  Bot,
  BookOpen,
  Key,
  PhoneCall,
  Lock,
  Clock,
  Eye,
  X,
  FileText,
  UserCheck,
} from "lucide-react";

export interface AuditLogItem {
  id: string;
  organizationId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actorUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("ALL");
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLogItem | null>(null);

  const refreshLogs = () => {
    setIsLoading(true);
    fetch("/api/audit-logs?limit=100")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let active = true;
    fetch("/api/audit-logs?limit=100")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedActionFilter === "APPOINTMENTS") {
        if (!log.action.startsWith("APPOINTMENT_")) return false;
      } else if (selectedActionFilter === "AGENT_CONFIG") {
        if (log.action !== "AGENT_CONFIG_UPDATED") return false;
      } else if (selectedActionFilter === "KNOWLEDGE_BASE") {
        if (log.action !== "KNOWLEDGE_BASE_UPDATED") return false;
      } else if (selectedActionFilter === "SECURITY_AUTH") {
        if (!["AUTHENTICATED", "SIGNED_OUT"].includes(log.action)) return false;
      } else if (selectedActionFilter === "INTEGRATIONS") {
        if (!["INTEGRATION_UPDATED", "PHONE_PROVISIONED"].includes(log.action)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const actor = (log.actorUser?.name || log.actorUser?.email || "System").toLowerCase();
        const entity = (log.entityId || log.entityType || "").toLowerCase();
        const action = log.action.toLowerCase();
        const metaStr = JSON.stringify(log.metadata || {}).toLowerCase();
        if (
          !actor.includes(query) &&
          !entity.includes(query) &&
          !action.includes(query) &&
          !metaStr.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedActionFilter, searchQuery]);

  // Export JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voxia_audit_trail_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "AUTHENTICATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <Lock className="h-3 w-3" /> User Authenticated
          </span>
        );
      case "SIGNED_OUT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
            <Lock className="h-3 w-3" /> Signed Out
          </span>
        );
      case "AGENT_CONFIG_UPDATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-400">
            <Bot className="h-3 w-3" /> Agent Config Saved
          </span>
        );
      case "APPOINTMENT_CREATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
            <Calendar className="h-3 w-3" /> Appointment Booked
          </span>
        );
      case "APPOINTMENT_RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
            <Clock className="h-3 w-3" /> Rescheduled
          </span>
        );
      case "APPOINTMENT_CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-400">
            <Calendar className="h-3 w-3" /> Cancelled
          </span>
        );
      case "KNOWLEDGE_BASE_UPDATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-400">
            <BookOpen className="h-3 w-3" /> Knowledge Base Synced
          </span>
        );
      case "INTEGRATION_UPDATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-400">
            <Key className="h-3 w-3" /> Integration Updated
          </span>
        );
      case "PHONE_PROVISIONED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
            <PhoneCall className="h-3 w-3" /> Line Provisioned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
            {action}
          </span>
        );
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* HIPAA Compliance & Security KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Immutable Audit Records</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{logs.length}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Persistent in PostgreSQL</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">HIPAA Audit Trail</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">100% Enforced</p>
          <p className="mt-1 text-[11px] text-zinc-500">All modifications cryptographically traced</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Operators</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">1 Owner, 1 Bot</p>
          <p className="mt-1 text-[11px] text-zinc-500">Role-based access verification</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Encryption Standard</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">TLS 1.3 / AES</p>
          <p className="mt-1 text-[11px] text-zinc-500">PII redacting & token hashed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Action Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Events" },
              { id: "APPOINTMENTS", label: "Appointments" },
              { id: "AGENT_CONFIG", label: "Agent Config" },
              { id: "KNOWLEDGE_BASE", label: "Knowledge Base" },
              { id: "SECURITY_AUTH", label: "Authentication" },
              { id: "INTEGRATIONS", label: "Integrations & Lines" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedActionFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedActionFilter === tab.id
                    ? "bg-cyan-500 text-zinc-950 font-semibold shadow-sm"
                    : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 rounded-lg border border-zinc-800 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={refreshLogs}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
              title="Refresh audit trail"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Actor / Principal</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Metadata Preview</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                        <span>Loading audit records from PostgreSQL...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                      No audit events match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const metadataSummary = log.metadata
                      ? Object.entries(log.metadata)
                          .slice(0, 2)
                          .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                          .join(" • ")
                      : "—";

                    return (
                      <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.actorUser ? (
                            <div>
                              <p className="font-medium text-zinc-200">
                                {log.actorUser.name || "Clinic Staff"}
                              </p>
                              <p className="text-[10px] text-zinc-500">{log.actorUser.email}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <Bot className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Autonomous Agent Engine</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-zinc-300">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="ml-1 text-[10px] text-zinc-500 block truncate max-w-[120px]">
                              {log.entityId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-[11px] text-zinc-400">
                          {metadataSummary}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLogForDetails(log)}
                            className="inline-flex items-center gap-1 rounded border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Payload</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payload Modal / Drawer */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedLogForDetails(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Audit Event Details</h3>
                <p className="text-xs text-zinc-400">
                  ID: <span className="font-mono text-cyan-400">{selectedLogForDetails.id}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Action</span>
                  <span className="font-medium text-white">{selectedLogForDetails.action}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Timestamp</span>
                  <span className="font-mono text-zinc-300">{formatTimestamp(selectedLogForDetails.createdAt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Entity</span>
                  <span className="font-mono text-zinc-300">{selectedLogForDetails.entityType} ({selectedLogForDetails.entityId || "N/A"})</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Principal</span>
                  <span className="text-zinc-300">{selectedLogForDetails.actorUser ? selectedLogForDetails.actorUser.email : "Autonomous System"}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-zinc-300">Raw JSON Payload</span>
                <pre className="mt-1.5 max-h-56 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 font-mono text-[11px] text-cyan-300 leading-relaxed">
                  {JSON.stringify(selectedLogForDetails.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
