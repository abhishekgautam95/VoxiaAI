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
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition-colors"
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
            className="relative h-1.5 w-full cursor-pointer rounded-full bg-zinc-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pct * totalDurationSec);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-cyan-500 shadow-sm transition-all duration-100"
              style={{ left: `calc(${progress}% - 6px)` }}
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
          className="shrink-0 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}
