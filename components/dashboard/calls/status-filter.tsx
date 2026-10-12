"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { CallStatus, statusOptions } from "./types";

interface StatusFilterProps {
  selected: CallStatus | "All";
  onChange: (status: CallStatus | "All") => void;
}

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        <Filter className="h-3.5 w-3.5 text-zinc-500" />
        <span>{selected === "All" ? "All Statuses" : selected}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 z-20">
          <button
            type="button"
            onClick={() => {
              onChange("All");
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
              selected === "All"
                ? "bg-zinc-800/80 text-white"
                : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
            }`}
          >
            All Statuses
            {selected === "All" && <Check className="h-3.5 w-3.5 text-cyan-400" />}
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                selected === status
                  ? "bg-zinc-800/80 text-white"
                  : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
              }`}
            >
              {status}
              {selected === status && <Check className="h-3.5 w-3.5 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
