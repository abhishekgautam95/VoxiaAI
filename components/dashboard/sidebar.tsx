"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  CalendarCheck,
  Bot,
  Settings,
  BarChart3,
  Phone,
  Zap,
  Activity,
  Headphones,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning";
}

const primaryNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Call Logs",
    href: "/dashboard/calls",
    icon: PhoneCall,
    badge: "18 new",
    badgeVariant: "success",
  },
  {
    title: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarCheck,
    badge: "6 today",
    badgeVariant: "default",
  },
  {
    title: "AI Agent Setup",
    href: "/dashboard/agent",
    icon: Bot,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    title: "Analytics & ROI",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Phone Numbers",
    href: "/dashboard/phone-numbers",
    icon: Phone,
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ calls: number; appointments: number }>({
    calls: 4,
    appointments: 6,
  });
  const [billingUsage, setBillingUsage] = useState({
    usedMinutes: 342,
    includedMinutes: 1000,
    percentMinutesUsed: 34,
  });
  const [agentInfo, setAgentInfo] = useState({
    displayName: "Sarah (Front Desk)",
    phoneNumber: "+1 (415) 800-4291",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/calls").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/appointments").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/billing").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/agent").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([callsData, apptsData, billingData, agentData]) => {
        if (callsData?.calls && Array.isArray(callsData.calls)) {
          setCounts((prev) => ({ ...prev, calls: callsData.calls.length }));
        }
        if (apptsData?.appointments && Array.isArray(apptsData.appointments)) {
          setCounts((prev) => ({ ...prev, appointments: apptsData.appointments.length }));
        }
        if (billingData?.usage) {
          setBillingUsage({
            usedMinutes: billingData.usage.usedMinutes ?? 342,
            includedMinutes: billingData.usage.includedMinutes ?? 1000,
            percentMinutesUsed: billingData.usage.percentMinutesUsed ?? 34,
          });
        }
        if (agentData?.agent) {
          setAgentInfo({
            displayName: agentData.agent.displayName || "Sarah (Front Desk)",
            phoneNumber: agentData.agent.phoneNumber || "+1 (415) 800-4291",
          });
        }
      })
      .catch(() => {});
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/95 text-zinc-300">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/70 px-5">
          <Link
            href="/dashboard"
            prefetch={false}
            onClick={onCloseMobile}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            {/* Animated Logo Icon */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-zinc-950">
                <div className="relative flex items-center justify-center">
                  {/* Subtle waveform bars */}
                  <span className="h-3.5 w-0.5 rounded-full bg-cyan-400 group-hover:scale-y-125 transition-transform" />
                  <span className="mx-0.5 h-5 w-0.5 rounded-full bg-cyan-300 group-hover:scale-y-110 transition-transform" />
                  <span className="mx-0.5 h-2.5 w-0.5 rounded-full bg-indigo-400 group-hover:scale-y-125 transition-transform" />
                  <span className="h-4 w-0.5 rounded-full bg-violet-400 group-hover:scale-y-90 transition-transform" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight text-zinc-100">
                  Voxia<span className="text-cyan-400">AI</span>
                </span>
                <span className="rounded border border-zinc-700/60 bg-zinc-800/80 px-1.5 py-0.2 text-[10px] font-medium text-zinc-400">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">Voice Receptionist</span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Navigation
            </div>
            <nav className="space-y-1" aria-label="Main Navigation">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={onCloseMobile}
                    className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-gradient-to-r from-zinc-800/90 to-zinc-900 text-white shadow-sm ring-1 ring-zinc-700/60"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          active
                            ? "text-cyan-400"
                            : "text-zinc-400 group-hover:text-zinc-300"
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-tight ${
                          item.badgeVariant === "success"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                        }`}
                      >
                        {item.href === "/dashboard/calls"
                          ? `${counts.calls} calls`
                          : item.href === "/dashboard/appointments"
                          ? `${counts.appointments} booked`
                          : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Infrastructure & Telephony */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Telephony & Tools
            </div>
            <nav className="space-y-1" aria-label="Telephony Navigation">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={onCloseMobile}
                    className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-zinc-800/90 text-white ring-1 ring-zinc-700/60"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          active
                            ? "text-cyan-400"
                            : "text-zinc-400 group-hover:text-zinc-300"
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Agent Real-time Status Card */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Live Receptionist
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-cyan-400">
                <Headphones className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {agentInfo.displayName}
                </p>
                <p className="truncate text-[10px] text-zinc-400">
                  {agentInfo.phoneNumber}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400" /> 38ms latency
              </span>
              <span className="text-emerald-400 font-medium">SIP Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Quota & Usage Bar */}
      <div className="border-t border-zinc-800/80 p-3">
        <div className="rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Voice Minutes
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">
              {billingUsage.usedMinutes.toLocaleString()} / {billingUsage.includedMinutes.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                billingUsage.percentMinutesUsed > 90
                  ? "bg-rose-500"
                  : billingUsage.percentMinutesUsed > 75
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-500"
              }`}
              style={{ width: `${Math.min(billingUsage.percentMinutesUsed, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
            <span>{billingUsage.percentMinutesUsed}% consumed</span>
            <Link
              href="/dashboard/settings"
              prefetch={false}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Upgrade Plan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
