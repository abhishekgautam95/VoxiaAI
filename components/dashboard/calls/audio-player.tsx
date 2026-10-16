"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { formatPlaybackTime } from "./types";

interface AudioPlayerProps {
  totalDurationSec: number;
}

export function AudioPlayer({ totalDurationSec }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speeds = [0.5, 1, 1.5, 2];

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDurationSec]);

  const progress =
    totalDurationSec > 0
      ? Math.min((currentTime / totalDurationSec) * 100, 100)
      : 0;

  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3">
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500 text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:bg-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Progress */}
        <div className="flex-1 space-y-1">
          <div
            className="relative h-1.5 w-full cursor-pointer rounded-sm bg-zinc-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pct * totalDurationSec);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-sm bg-cyan-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-1.5 rounded-sm bg-white border border-cyan-400 shadow-sm transition-all duration-100"
              style={{ left: `calc(${progress}% - 3px)` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>{formatPlaybackTime(currentTime)}</span>
            <span>{formatPlaybackTime(totalDurationSec)}</span>
          </div>
        </div>

        {/* Volume Icon */}
        <Volume2 className="h-4 w-4 shrink-0 text-zinc-500" />

        {/* Playback Speed */}
        <button
          type="button"
          onClick={() => {
            const idx = speeds.indexOf(playbackSpeed);
            setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
          }}
          className="shrink-0 rounded-md border border-zinc-800/80 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:border-cyan-500/30 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}
