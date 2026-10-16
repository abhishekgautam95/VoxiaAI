"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Phone,
  Clock,
  Download,
  ShieldCheck,
  Zap,
  RefreshCw,
} from "lucide-react";

export interface SubscriptionData {
  id: string;
  tier: "STARTER" | "PRO" | "ENTERPRISE";
  status: string;
  includedMinutes: number;
  usedMinutes: number;
  includedNumbers: number;
  extraMinuteRate: number;
  currentPeriodEnd: string;
  stripeCustomerId?: string | null;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  amountDueCents: number;
  amountPaidCents: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface TierOption {
  id: "STARTER" | "PRO" | "ENTERPRISE";
  name: string;
  priceMonthly: number;
  includedMinutes: number;
  includedNumbers: number;
  description: string;
  features: string[];
}

export function BillingView() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [usage, setUsage] = useState({
    usedMinutes: 342,
    includedMinutes: 1000,
    percentMinutesUsed: 34,
    activeNumbers: 1,
    includedNumbers: 3,
    extraMinuteRate: 0.15,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/billing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          if (data.subscription) setSubscription(data.subscription);
          if (Array.isArray(data.invoices)) setInvoices(data.invoices);
          if (Array.isArray(data.tiers)) setTiers(data.tiers);
          if (data.usage) setUsage(data.usage);
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

  const handleUpgradeTier = async (targetTier: "STARTER" | "PRO" | "ENTERPRISE") => {
    setUpgradingTier(targetTier);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.checkoutUrl) {
          window.location.assign(data.checkoutUrl);
          return;
        }
        if (data.subscription) setSubscription(data.subscription);
        if (data.invoice) {
          setInvoices((prev) => [data.invoice, ...prev]);
        }
        setToastMessage(data.message || `Switched to ${targetTier} plan!`);
        setTimeout(() => setToastMessage(null), 4000);
      } else if (data?.error) {
        setToastMessage(data.error);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      // ignore
    } finally {
      setUpgradingTier(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
        <span className="text-xs">Loading billing telemetry and subscription details...</span>
      </div>
    );
  }

  const currentTier = subscription?.tier || "PRO";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Plan & Usage Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Plan Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-zinc-900/60 to-zinc-950 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-28 w-28 text-cyan-400" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              Current Active Plan
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              {subscription?.status || "ACTIVE"}
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-extrabold text-white">
            {currentTier === "STARTER"
              ? "Clinic Starter"
              : currentTier === "PRO"
              ? "Practice Pro"
              : "Multi-Location Enterprise"}
          </h3>

          <p className="mt-1 text-xs text-zinc-400">
            {currentTier === "PRO"
              ? "$499 / month • Billed monthly"
              : currentTier === "STARTER"
              ? "$199 / month • Billed monthly"
              : "$999 / month • Billed monthly"}
          </p>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Billing Cycle Ends</span>
              <span className="font-medium text-zinc-200">
                {subscription ? formatDate(subscription.currentPeriodEnd) : "Next Month"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Stripe Customer ID</span>
              <span className="font-mono text-[11px] text-zinc-400">
                {subscription?.stripeCustomerId || "cus_live_992182"}
              </span>
            </div>
          </div>
        </div>

        {/* Telephony Minute Meter Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Voice Answering Meter</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {usage.usedMinutes} / {usage.includedMinutes} Mins
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                usage.percentMinutesUsed > 85 ? "bg-amber-400" : "bg-cyan-500"
              }`}
              style={{ width: `${Math.max(usage.percentMinutesUsed, 5)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>{usage.percentMinutesUsed}% Quota Consumed</span>
            <span className="text-emerald-400 font-medium">
              Overage: ${usage.extraMinuteRate.toFixed(2)}/min
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-2">
            Includes inbound telephony, caller speech-to-text, and ElevenLabs neural streaming synthesis.
          </p>
        </div>

        {/* Carrier Lines & Payment Method */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Phone className="h-4 w-4 text-violet-400" />
              <span>Carrier Lines Allocated</span>
            </div>
            <span className="text-xs font-mono font-bold text-violet-400">
              {usage.activeNumbers} / {usage.includedNumbers} Lines
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-violet-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.round((usage.activeNumbers / usage.includedNumbers) * 100),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
                <CreditCard className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">Visa ending in 4242</p>
                <p className="text-[10px] text-zinc-500">Expires 12/28 • Default</p>
              </div>
            </div>
            <button
              type="button"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Plan Comparison & Upgrade Matrix */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Scale Receptionist Capacity</h3>
          <p className="text-xs text-zinc-400">
            Switch tiers dynamically as your practice call volume grows. Upgrades apply instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {tiers.map((t) => {
            const isCurrent = t.id === currentTier;
            return (
              <div
                key={t.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/50"
                    : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{t.name}</h4>
                    {isCurrent && (
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">${t.priceMonthly}</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">{t.description}</p>

                  <div className="mt-4 border-t border-zinc-800 pt-3 space-y-2">
                    {t.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3">
                  <button
                    type="button"
                    disabled={isCurrent || upgradingTier !== null}
                    onClick={() => handleUpgradeTier(t.id)}
                    className={`w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-zinc-800 text-zinc-500 cursor-default"
                        : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
                    }`}
                  >
                    {upgradingTier === t.id
                      ? "Processing..."
                      : isCurrent
                      ? "Current Tier"
                      : `Upgrade to ${t.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Billing & Payment Invoices</h3>
            <p className="text-xs text-zinc-400">
              Download tax receipts and itemized monthly telephony usage summaries.
            </p>
          </div>
          <span className="text-[11px] text-zinc-500">
            {invoices.length} Invoices on Record
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Billing Period</th>
                <th className="px-4 py-3">Date Issued</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">PDF Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-cyan-400 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {formatDate(inv.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                    {formatCurrency(inv.amountPaidCents)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Paid
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        alert(`Downloading receipt ${inv.invoiceNumber} (${formatCurrency(inv.amountPaidCents)})...`)
                      }
                      className="inline-flex items-center gap-1 rounded border border-zinc-700/80 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white hover:border-cyan-500 transition-colors"
                    >
                      <Download className="h-3 w-3 text-cyan-400" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
