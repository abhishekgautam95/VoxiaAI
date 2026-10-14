"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Power,
  PhoneCall,
  Bell,
  Shield,
  Key,
  LogOut,
  Sliders,
  Menu,
  Mic,
  Calendar,
  CheckCheck,
  Sparkles,
} from "lucide-react";

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "appointment" | "call" | "security";
  href: string;
  unread: boolean;
}

const DEFAULT_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: "notif-1",
    title: "New Appointment Booked",
    description: "Marcus Brody confirmed for Routine Cleaning tomorrow at 10:30 AM",
    time: "10 mins ago",
    type: "appointment",
    href: "/dashboard/appointments",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Emergency Toothache Handled",
    description: "Eleanor Vance reserved urgent slot with Dr. Sarah Smith",
    time: "45 mins ago",
    type: "appointment",
    href: "/dashboard/appointments",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Live Call Transcript Analyzed",
    description: "Delta Dental insurance verification query resolved with 100% positive sentiment",
    time: "2 hours ago",
    type: "call",
    href: "/dashboard/calls",
    unread: false,
  },
  {
    id: "notif-4",
    title: "HIPAA Audit Trail Synced",
    description: "Immutable compliance checkpoint recorded with SHA-256 integrity hash",
    time: "4 hours ago",
    type: "security",
    href: "/dashboard/settings",
    unread: false,
  },
];

interface Organization {
  id: string;
  name: string;
  plan: string;
  phone: string;
}

const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Apex Health & Dental",
    plan: "Enterprise",
    phone: "+1 (415) 800-4291",
  },
  {
    id: "org-2",
    name: "Metro Urgent Care",
    plan: "Pro Tier",
    phone: "+1 (312) 555-0199",
  },
  {
    id: "org-3",
    name: "Harbor View Law Group",
    plan: "Pro Tier",
    phone: "+1 (206) 555-7840",
  },
];

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();

  // Session & Org state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [currentOrg, setCurrentOrg] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization>(mockOrganizations[0]);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  // Agent live status state
  const [isAgentLive, setIsAgentLive] = useState(true);

  // User Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<HeaderNotification[]>(DEFAULT_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const hasUnread = notifications.some((n) => n.unread);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user && data?.organization) {
          setCurrentUser(data.user);
          setCurrentOrg(data.organization);
          setSelectedOrg({
            id: data.organization.id,
            name: data.organization.name,
            plan: "Enterprise",
            phone: "+1 (415) 800-4291",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectOrg = async (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgDropdownOpen(false);
    try {
      const res = await fetch("/api/auth/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: org.id,
          name: org.name,
          phone: org.phone,
        }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // ignore
    }
  };

  const handleTestCall = () => {
    router.push("/dashboard/agent?testCall=true");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrgDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left section: Mobile menu trigger + Org Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Organization / Business Selector Dropdown */}
        <div className="relative" ref={orgDropdownRef}>
          <button
            type="button"
            onClick={() => setIsOrgDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-left text-sm transition-all hover:border-zinc-700 hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            aria-expanded={isOrgDropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-sm">
              <Building2 className="h-3.5 w-3.5" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="max-w-[130px] truncate font-medium text-zinc-100 sm:max-w-[180px]">
                  {selectedOrg.name}
                </span>
                <span className="hidden rounded bg-cyan-950/80 border border-cyan-800/50 px-1 py-0.2 text-[9px] font-semibold tracking-wide text-cyan-300 sm:inline-block">
                  {selectedOrg.plan}
                </span>
              </div>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                isOrgDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Org Selector Dropdown Menu */}
          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Organizations & Clinics
              </div>

              <div className="space-y-1">
                {mockOrganizations.map((org) => {
                  const isSelected = org.id === selectedOrg.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => handleSelectOrg(org)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                        isSelected
                          ? "bg-zinc-800/80 text-white"
                          : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
                            isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-zinc-200">{org.name}</p>
                          <p className="text-[10px] text-zinc-400">{org.phone}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="h-4 w-4 text-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1.5 border-t border-zinc-800 pt-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-950/30 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect New Business / Inbound Line</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Active Agent status, Simulator button, notifications, user profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Active Agent Status Badge (Live / Offline) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsAgentLive((prev) => !prev)}
            className={`group relative flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
              isAgentLive
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 shadow-sm shadow-emerald-950"
                : "border-zinc-700/60 bg-zinc-900 text-zinc-400 hover:bg-zinc-800/80"
            }`}
            title={`Click to ${isAgentLive ? "pause/disable" : "activate"} live phone answering`}
          >
            {/* Live radar pulsator or offline muted dot */}
            {isAgentLive ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
            )}

            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight">
                {isAgentLive ? "Agent Live" : "Agent Offline"}
              </span>
              <span className="hidden md:inline-block text-[10px] opacity-75">
                • Sarah
              </span>
            </div>

            <Power
              className={`h-3 w-3 transition-colors ${
                isAgentLive
                  ? "text-emerald-400 group-hover:text-emerald-200"
                  : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
          </button>
        </div>

        {/* Quick Test Call Simulator Button */}
        <button
          type="button"
          onClick={handleTestCall}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-700/70 bg-gradient-to-r from-zinc-800/90 to-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 shadow-sm transition-all hover:border-cyan-500/50 hover:text-white hover:shadow-cyan-500/10"
        >
          <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
          <span>Test Call</span>
        </button>

        {/* Notifications Icon & Dropdown */}
        <div className="relative" ref={notificationsDropdownRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            aria-label="View notifications"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-zinc-950" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Live Clinic Activity</span>
                </div>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                    }
                    className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <a
                    key={notif.id}
                    href={notif.href}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                      );
                      setIsNotificationsOpen(false);
                    }}
                    className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                      notif.unread
                        ? "bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800"
                        : "hover:bg-zinc-900/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs ${
                        notif.type === "appointment"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : notif.type === "call"
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {notif.type === "appointment" ? (
                        <Calendar className="h-4 w-4" />
                      ) : notif.type === "call" ? (
                        <PhoneCall className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-zinc-100 truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 shrink-0">{notif.time}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug line-clamp-2">
                        {notif.description}
                      </p>
                    </div>

                    {notif.unread && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    )}
                  </a>
                ))}
              </div>

              <div className="mt-2.5 border-t border-zinc-800/80 pt-2 text-center">
                <a
                  href="/dashboard/calls"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View All Call Records & Transcripts &rarr;
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            {/* Avatar Pill */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-sm ring-1 ring-zinc-700">
              {currentUser?.name ? currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "OW"}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-zinc-950 bg-emerald-500" />
            </div>

            <ChevronDown
              className={`hidden md:block h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Card Header */}
              <div className="border-b border-zinc-800/80 px-3 py-2.5">
                <p className="text-xs font-semibold text-zinc-100">{currentUser?.name || "Workspace Owner"}</p>
                <p className="truncate text-[11px] text-zinc-400">
                  {currentUser?.email || "demo.owner@voxia.local"}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">
                  <Shield className="h-2.5 w-2.5" /> {currentOrg?.name || "Apex Health & Dental"}
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1 text-xs">
                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Receptionist Preferences</span>
                </a>

                <a
                  href="/dashboard/agent"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-colors"
                >
                  <Mic className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Voice & LLM Model Tuning</span>
                </a>

                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-colors"
                >
                  <Key className="h-3.5 w-3.5 text-zinc-400" />
                  <span>API Keys & Webhooks</span>
                </a>
              </div>

              {/* Sign out */}
              <div className="border-t border-zinc-800/80 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
