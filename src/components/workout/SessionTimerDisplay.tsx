"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionTimerDisplayProps {
  elapsedSeconds: number;
  startedAt: Date | null;
  variant: 'sidebar' | 'mobile';
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function SessionTimerDisplay({
  elapsedSeconds,
  startedAt,
  variant,
}: SessionTimerDisplayProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex items-center space-x-2 text-white/70 font-mono text-sm">
        {startedAt && (
          <span className="hidden xs:inline">{format(startedAt, 'h:mm a')} • </span>
        )}
        <span className="text-white font-bold">{formatDuration(elapsedSeconds)}</span>
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
        <Clock className="w-3 h-3" />
        <span>Session Duration</span>
      </div>
      <div className="text-4xl font-mono font-bold text-foreground tracking-tighter">
        {formatDuration(elapsedSeconds)}
      </div>
      {startedAt && (
        <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
          Started at {format(startedAt, 'h:mm a')}
        </div>
      )}
    </div>
  );
}
