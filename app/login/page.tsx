"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2, Zap } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillDemoCredentials = () => {
    setEmail("demo.owner@voxia.local");
    setPassword("VoxiaDemo!2026");
    setOrgSlug("apex-health-dental");
    setErrorMessage(null);
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail("demo.owner@voxia.local");
    setPassword("VoxiaDemo!2026");
    setOrgSlug("apex-health-dental");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo.owner@voxia.local",
          password: "VoxiaDemo!2026",
          organizationSlug: "apex-health-dental",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to authenticate.");
        setIsLoading(false);
        return;
      }

      window.location.assign(redirectTarget);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          organizationSlug: orgSlug.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to authenticate. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      window.location.assign(redirectTarget);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">Welcome to VoxiaAI</h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Sign in to your autonomous voice receptionist workspace
        </p>
      </div>

      {/* Demo Credentials Quick Fill Banner */}
      <div className="mt-5 rounded-xl border border-cyan-500/30 bg-zinc-900 p-3.5 text-xs space-y-2 shadow-md shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wide">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Seeded Demo Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="rounded-md border border-zinc-800/80 bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-zinc-300 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              Fill Inputs
            </button>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-1 font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <Zap className="h-3 w-3" />
              <span>1-Click Sign In</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400">
          Email: <span className="text-zinc-200 font-mono">demo.owner@voxia.local</span> • Pass: <span className="text-zinc-200 font-mono">VoxiaDemo!2026</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-400">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Work Email</label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-zinc-800/80 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Password</label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800/80 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
            Workspace Slug <span className="text-zinc-600">(Optional)</span>
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Building2 className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="e.g. apex-health-dental"
              className="w-full rounded-lg border border-zinc-800/80 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Sign In to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted Session with SHA-256 Auth & Audit Trails</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-20 h-[360px] w-[420px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
