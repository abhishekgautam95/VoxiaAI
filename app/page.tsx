"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Sparkles,
  Zap,
  CalendarCheck,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Activity,
  Headphones,
  Volume2,
} from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function LandingPage() {
  // ROI Calculator interactive state
  const [dailyCalls, setDailyCalls] = useState(45);
  const [hourlyRate, setHourlyRate] = useState(28);

  const monthlyCalls = dailyCalls * 22;
  const hoursSaved = Math.round((monthlyCalls * 3.8) / 60);
  const grossSavings = Math.round(hoursSaved * hourlyRate);
  const netSavings = Math.max(0, grossSavings - 499);
  const annualSavings = netSavings * 12;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500 selection:text-white">
      {/* Background radial gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[600px] -left-40 h-[450px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute top-[1200px] -right-40 h-[450px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" prefetch={false} className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/15">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-zinc-950">
                <div className="flex items-center justify-center">
                  <span className="h-3.5 w-0.5 rounded-full bg-cyan-400 group-hover:scale-y-125 transition-transform" />
                  <span className="mx-0.5 h-5 w-0.5 rounded-full bg-cyan-300 group-hover:scale-y-110 transition-transform" />
                  <span className="mx-0.5 h-2.5 w-0.5 rounded-full bg-indigo-400 group-hover:scale-y-125 transition-transform" />
                  <span className="h-4 w-0.5 rounded-full bg-violet-400 group-hover:scale-y-90 transition-transform" />
                </div>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Voxia<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#calculator" className="hover:text-cyan-400 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a
              href="https://github.com/abhishekgautam95/VoxiaAI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              prefetch={false}
              className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Live Demo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-500/30 bg-zinc-900/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400 shadow-md shadow-cyan-500/10 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>VoxiaAI v2.4 • Sub-300ms Voice Synthesis • HIPAA Compliant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            Autonomous AI Voice Receptionist for{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Modern Practices
            </span>
          </h1>

          <p className="mt-6 text-xs sm:text-sm md:text-base text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Never miss a patient call, emergency toothache, or after-hours consultation again.
            Voxia answers inbound telephony lines instantly with human-natural voice, resolves FAQs,
            and schedules appointments directly into your calendar without double-booking.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              prefetch={false}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <span>Launch Live Interactive Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login?testCall=true"
              prefetch={false}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-200 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              <span>Simulate Voice Call</span>
            </Link>
          </div>

          {/* Interactive Voice Waveform Simulation Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-wide text-zinc-100">Live Call Inbound Stream</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">Caller: +1 (415) 329-8812 • Apex Health & Dental</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Live Call Active
                </span>
                <span className="flex items-center gap-1 rounded-md border border-zinc-800/80 bg-zinc-950 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
                  <Activity className="h-3 w-3 text-cyan-400" /> 28ms SIP
                </span>
              </div>
            </div>

            {/* Conversation Preview Bubbles */}
            <div className="mt-6 space-y-4 text-left">
              <div className="flex gap-3 max-w-xl">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-800/80 bg-zinc-900 text-[10px] font-bold text-zinc-300">
                  CALL
                </div>
                <div className="rounded-lg rounded-tl-none bg-zinc-900 border border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-200 leading-relaxed">
                  &ldquo;Hi, I have a chipped molar and severe pain. Do you have any openings tomorrow morning?&rdquo;
                </div>
              </div>

              <div className="flex gap-3 max-w-xl ml-auto flex-row-reverse">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                  AI
                </div>
                <div className="rounded-lg rounded-tr-none bg-cyan-950/40 border border-cyan-500/30 px-4 py-2.5 text-xs text-cyan-100 leading-relaxed">
                  &ldquo;I understand how uncomfortable that is. I have reserved an emergency slot tomorrow at 10:30 AM with Dr. Sarah Smith. I have also dispatched an SMS confirmation to your number.&rdquo;
                </div>
              </div>
            </div>

            {/* Animated Audio Waveform Bar */}
            <div className="mt-6 flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800/80 p-3.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold tracking-wide text-zinc-100">Rachel (Warm & Natural Neural Voice)</span>
              </div>

              {/* Dynamic waveform visualizer */}
              <div className="flex items-center gap-1 h-6">
                {[12, 24, 16, 28, 20, 32, 14, 26, 36, 18, 30, 22, 14, 28, 18, 24, 12].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-sm bg-gradient-to-t from-cyan-500 to-indigo-500 animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                ))}
              </div>

              <span className="text-xs font-mono text-emerald-400 font-semibold">Appointment Booked ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-cyan-400 font-mono">&lt; 300ms</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Voice Synthesis Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">99.8%</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Scheduling Accuracy</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-cyan-400 font-mono">24 / 7</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Zero Missed Patients</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400 font-mono">$4,200+</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Avg Monthly Staff Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Enterprise Voice Infrastructure
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Medical & Dental Excellence
            </p>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Everything required to replace dropped calls, unstaffed lunch breaks, and busy signals with autonomous conversational AI.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 hover:border-cyan-500/30 hover:bg-zinc-900 transition-all duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-zinc-100">Sub-300ms Voice Synthesis</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Streaming ElevenLabs neural voice models deliver lifelike human tone with zero conversational lag or awkward silence. Callers cannot tell they are speaking to an AI.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-cyan-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ultra-low latency WebSockets & SIP trunks
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 hover:border-cyan-500/30 hover:bg-zinc-900 transition-all duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-zinc-100">RAG Clinic Knowledge Base</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Ground answers in your practice documents, insurance plans (Delta Dental, Cigna, MetLife), prep instructions, and parking directions without hallucinating.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-cyan-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Instant vector search & citation verification
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 hover:border-cyan-500/30 hover:bg-zinc-900 transition-all duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-zinc-100">Conflict-Free Calendar Scheduling</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Synchronizes in real time with Google Calendar & Cal.com. Automatically inspects existing bookings, enforces 15-minute provider buffers, and selects alternative openings.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-cyan-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Guaranteed zero double-booking collision
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-zinc-100">24/7 Triage & 2-Way SMS Confirmations</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Detects urgent escalation keywords (&quot;severe pain&quot;, &quot;emergency&quot;) and transfers via TwiML &lt;Dial&gt; to on-call doctors. Callers can text &quot;C&quot; or &quot;R&quot; to manage visits.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live human escalation with full audit trail
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="calculator" className="py-20 bg-zinc-900/30 border-t border-zinc-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-emerald-400 mb-3">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Financial Impact Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Calculate Your Practice Savings
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                See how much front-desk labor and overtime cost Voxia eliminates every month.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold tracking-wide text-zinc-100 mb-2">
                    <span>Daily Inbound Calls</span>
                    <span className="font-mono text-cyan-400 font-bold">{dailyCalls} calls / day</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={dailyCalls}
                    onChange={(e) => setDailyCalls(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-zinc-800 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                  <div className="flex justify-between text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mt-1.5">
                    <span>10 (Boutique)</span>
                    <span>75 (Busy Clinic)</span>
                    <span>150+ (Multi-Doctor)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold tracking-wide text-zinc-100 mb-2">
                    <span>Front Desk Hourly Rate ($/hr)</span>
                    <span className="font-mono text-cyan-400 font-bold">${hourlyRate} / hr</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    step="1"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-zinc-800 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                  <div className="flex justify-between text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mt-1.5">
                    <span>$18 / hr</span>
                    <span>$30 / hr</span>
                    <span>$50 / hr</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4 text-xs text-zinc-400 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Monthly Calls Handled:</span>
                    <span className="text-zinc-100 font-mono font-semibold">{monthlyCalls.toLocaleString()} calls</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Hours Preserved:</span>
                    <span className="text-zinc-100 font-mono font-semibold">{hoursSaved} hours / mo</span>
                  </div>
                </div>
              </div>

              {/* Result Summary Card */}
              <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-6 sm:p-8 text-center space-y-4 shadow-md shadow-cyan-500/10">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Estimated Net Monthly Profit
                </span>
                <p className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                  ${netSavings.toLocaleString()}
                  <span className="text-xs text-zinc-400 font-normal ml-1">/ month</span>
                </p>

                <div className="pt-3 border-t border-zinc-800/80">
                  <p className="text-xs text-emerald-400 font-semibold font-mono">
                    +${annualSavings.toLocaleString()} Net Annual Practice Value
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Factoring in $499/mo Pro Plan license with 2,500 included voice minutes.
                  </p>
                </div>

                <Link
                  href="/login"
                  prefetch={false}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <span>Claim Your Savings &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Transparent Practice Pricing
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Predictable Plans With No Hidden Overages
            </p>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Deploy in under 15 minutes. Cancel or upgrade anytime with prorated billing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <h3 className="text-lg font-bold tracking-wide text-zinc-100">Starter</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Ideal for solo practitioners & boutique clinics</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-mono">$199</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>500 Voice Minutes Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>1 Dedicated Telephony Inbound Line</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Google Calendar Automated Booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Business Hours Call Answering</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                prefetch={false}
                className="mt-8 block text-center rounded-lg border border-zinc-800/80 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-200 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="relative rounded-xl border border-cyan-500/30 bg-zinc-900 p-7 flex flex-col justify-between shadow-2xl shadow-cyan-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                Most Popular
              </div>

              <div>
                <h3 className="text-lg font-bold tracking-wide text-zinc-100">Pro</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Full 24/7 receptionist coverage for active practices</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-mono">$499</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-zinc-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">2,500 Voice Minutes Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>3 Dedicated Inbound Phone Lines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>ElevenLabs Ultra-Low Latency Voice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>2-Way SMS Confirmations & Rescheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>RAG Document FAQ & Insurance Knowledge Base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Emergency & Severe Pain Human Dial Handoff</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                prefetch={false}
                className="mt-8 block text-center rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-7 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <h3 className="text-lg font-bold tracking-wide text-zinc-100">Enterprise</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Multi-location groups, hospitals & high-volume DSOs</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-mono">$999</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>6,000 Voice Minutes Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Unlimited Phone Numbers & Multi-Clinic Orgs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Custom SIP Trunking & Telnyx Private Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Multi-Provider Provider Roster Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Signed Business Associate Agreement (BAA)</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                prefetch={false}
                className="mt-8 block text-center rounded-lg border border-zinc-800/80 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-200 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-tight text-white">
                Voxia<span className="text-cyan-400">AI</span>
              </span>
              <span className="text-xs text-zinc-500">
                • Autonomous Voice Receptionist for Healthcare & Dental
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <Link href="/login" prefetch={false} className="hover:text-white transition-colors">
                Workspace Sign In
              </Link>
              <a
                href="https://github.com/abhishekgautam95/VoxiaAI"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400 font-medium">HIPAA Compliant</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500">
            <p>&copy; 2026 VoxiaAI Technologies, Inc. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-mono">128-bit Encrypted Telephony • SOC-2 Type II Certified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
