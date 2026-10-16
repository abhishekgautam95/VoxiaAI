"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { X } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex selection:bg-cyan-500 selection:text-white">
      {/* Multi-layered radial atmospheric background lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[420px] -left-40 h-[450px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-100px] h-[420px] w-[480px] rounded-full bg-cyan-500/5 blur-[130px]" />
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-zinc-950 border-r border-zinc-800/80 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute right-3 top-3.5 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
