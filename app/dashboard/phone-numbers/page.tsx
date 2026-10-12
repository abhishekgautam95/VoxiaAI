"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Phone, Plus } from "lucide-react";

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Telephony Phone Numbers</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Provision and configure dedicated toll-free and local numbers assigned to your AI receptionist.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Provision New Number
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
          Loading assigned phone numbers...
        </div>
      ) : numbers.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <Phone className="mx-auto h-8 w-8 text-zinc-500" />
          <p className="mt-2 text-sm text-zinc-300">No phone numbers provisioned yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-xs text-cyan-400 hover:underline"
          >
            Provision your first phone number &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {numbers.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-zinc-100">{item.number}</p>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {item.provider}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {item.label} • {item.cityState} • Assigned to <span className="text-cyan-300 font-medium">{item.assignedAgent}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Routing Live (SIP Trunk Active)</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Provision Dedicated Phone Line</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Instantly allocate a local number connected to your AI voice receptionist SIP trunk.
            </p>

            <form onSubmit={handleProvision} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300">Target Area Code</label>
                <select
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="415">415 — San Francisco, CA</option>
                  <option value="510">510 — Oakland / East Bay, CA</option>
                  <option value="312">312 — Chicago, IL</option>
                  <option value="212">212 — New York, NY</option>
                  <option value="800">800 — Toll-Free US</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">Line Label</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. VIP Urgent Care Line"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
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
