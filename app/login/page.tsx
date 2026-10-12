"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
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

      router.push(redirectTarget);
      router.refresh();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome to VoxiaAI</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Sign in to your autonomous voice receptionist workspace
        </p>
      </div>

      {/* Demo Credentials Quick Fill Banner */}
      <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 font-medium">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Try with Seeded Demo Account</span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="rounded-lg bg-cyan-500/20 px-2.5 py-1 font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            Auto-fill
          </button>
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">
          Email: <span className="text-zinc-200 font-mono">demo.owner@voxia.local</span> • Pass: <span className="text-zinc-200 font-mono">VoxiaDemo!2026</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300">Work Email</label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300">Password</label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400">
            Workspace Slug <span className="text-zinc-500">(Optional)</span>
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Building2 className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="e.g. apex-health-dental"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
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
      {/* Background decorative glow */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
