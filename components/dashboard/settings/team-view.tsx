"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  X,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

export type RoleType = "OWNER" | "ADMIN" | "OPERATOR" | "ANALYST";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: RoleType;
  joinedAt: string;
}

const roleBadgeStyles: Record<RoleType, { bg: string; text: string; border: string }> = {
  OWNER: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  ADMIN: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  OPERATOR: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  ANALYST: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
};

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleType>("OPERATOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    fetch("/api/team")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.members)) {
          setMembers(data.members);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName || undefined,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error || "Failed to invite team member.");
        return;
      }

      setToastMessage(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("OPERATOR");
      fetchMembers();

      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setErrorMessage("Network error while sending invite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-3.5 text-xs font-medium text-emerald-300 shadow-lg shadow-emerald-950/40 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-white">Team & Staff Access</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Manage practice receptionists, clinic administrators, and providers with HIPAA-compliant role-based access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsInviteModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Total Staff</span>
          <p className="mt-1 text-lg font-bold text-white">{members.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Administrators</span>
          <p className="mt-1 text-lg font-bold text-cyan-400">
            {members.filter((m) => m.role === "ADMIN" || m.role === "OWNER").length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Operators & Desk</span>
          <p className="mt-1 text-lg font-bold text-emerald-400">
            {members.filter((m) => m.role === "OPERATOR").length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Security Standard</span>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Lock className="h-3 w-3 text-cyan-400" /> HIPAA RBAC
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter staff by name or email..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Access Role</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Loading team members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const style = roleBadgeStyles[member.role] || roleBadgeStyles.OPERATOR;
                  const initials = member.name
                    ? member.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "ST";

                  return (
                    <tr key={member.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 font-bold text-[11px] text-white">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-100">{member.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">ID: {member.userId.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-zinc-300 font-mono">
                        {member.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <Shield className="h-3 w-3" />
                          {member.role}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-3.5 text-zinc-400">
                        {new Date(member.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Invite Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="doctor@practice.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Dr. Alexander Wright"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleType)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="OPERATOR">Operator — Front desk, call monitoring & appointment bookings</option>
                  <option value="ADMIN">Admin — Full practice configuration, telephony & AI tuning</option>
                  <option value="ANALYST">Analyst — Financial ROI reports and transcript review</option>
                </select>
                <p className="mt-1.5 text-[10px] text-zinc-500">
                  Team members will receive login credentials with instant access to their workspace.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending Invite...</span>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Send Invite</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
