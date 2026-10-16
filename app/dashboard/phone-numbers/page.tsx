"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Phone, Plus, Copy, Check, Trash2, Power } from "lucide-react";

interface PhoneNumberItem {
  id: string;
  number: string;
  label: string;
  cityState: string;
  assignedAgent: string;
  status: string;
  provider: string;
}

export default function PhoneNumbersPage() {
  const [numbers, setNumbers] = useState<PhoneNumberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [areaCode, setAreaCode] = useState("415");
  const [label, setLabel] = useState("Main Clinic Inbound");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadNumbers = useCallback(() => {
    fetch("/api/phone-numbers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.phoneNumbers)) {
          setNumbers(data.phoneNumbers);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadNumbers();
  }, [loadNumbers]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/phone-numbers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setNumbers((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: nextStatus } : n))
        );
      }
    } catch {
      setActionError("Failed to update status");
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleDeleteNumber = async (id: string, numberStr: string) => {
    if (!confirm(`Are you sure you want to release ${numberStr}? Incoming calls to this line will no longer connect.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/phone-numbers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNumbers((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      setActionError("Failed to release number");
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      const res = await fetch("/api/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaCode,
          label,
          cityState: areaCode === "415" ? "San Francisco, CA" : areaCode === "312" ? "Chicago, IL" : "New York, NY",
        }),
      });

      if (res.ok) {
        await loadNumbers();
        setShowModal(false);
      }
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Telephony Phone Numbers</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Provision and configure dedicated toll-free and local numbers assigned to your AI receptionist.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          <Plus className="h-4 w-4" /> Provision New Number
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/60 px-3.5 py-2 text-xs text-rose-400">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          Loading assigned phone numbers...
        </div>
      ) : numbers.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center">
          <Phone className="mx-auto h-8 w-8 text-zinc-500" />
          <p className="mt-2 text-sm font-bold tracking-wide text-zinc-100">No phone numbers provisioned yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-xs font-semibold text-cyan-400 hover:underline focus:outline-none"
          >
            Provision your first phone number &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {numbers.map((item) => {
            const isActive = item.status === "ACTIVE";
            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-cyan-500/30 hover:bg-zinc-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm ${
                        isActive
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-zinc-900 border-zinc-800/80 text-zinc-500"
                      }`}
                    >
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold tracking-wide text-zinc-100">{item.number}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.number)}
                          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                          title="Copy phone number"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <span className="rounded-md border border-zinc-800/80 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                          {item.provider}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {item.label} • {item.cityState} • Assigned to{" "}
                        <span className="text-cyan-400 font-semibold">{item.assignedAgent}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
                        isActive
                          ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60"
                          : "bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      }`}
                      title={isActive ? "Click to pause answering" : "Click to activate answering"}
                    >
                      <Power className={`h-3 w-3 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                      <span>{isActive ? "Routing Live" : "Line Paused"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNumber(item.id, item.number)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                      title="Release line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-zinc-800/80 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold tracking-tight text-white">Provision Dedicated Phone Line</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Instantly allocate a local number connected to your AI voice receptionist SIP trunk.
            </p>

            <form onSubmit={handleProvision} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Target Area Code</label>
                <select
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="415">415 — San Francisco, CA</option>
                  <option value="510">510 — Oakland / East Bay, CA</option>
                  <option value="312">312 — Chicago, IL</option>
                  <option value="212">212 — New York, NY</option>
                  <option value="800">800 — Toll-Free US</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Line Label</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. VIP Urgent Care Line"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  {isProvisioning ? "Provisioning..." : "Confirm & Provision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
