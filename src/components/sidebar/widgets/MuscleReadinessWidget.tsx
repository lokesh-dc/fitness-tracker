"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import type { MuscleRecovery, RecoveryState } from "@/types/workout";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const DOT: Record<RecoveryState, string> = {
  fatigued: "bg-red-500",
  recovering: "bg-amber-400",
  ready: "bg-emerald-400",
  untrained: "bg-foreground/20",
};

const COLOR: Record<RecoveryState, string> = {
  fatigued: "#ef4444",
  recovering: "#fbbf24",
  ready: "#34d399",
  untrained: "transparent",
};

function fmtHours(h: number): string {
  if (h <= 0) return "Ready";
  if (h < 1) return "~30m";
  return `~${Math.round(h)}h`;
}

interface MuscleReadinessWidgetProps {
  recovery: MuscleRecovery[];
  variant?: "sidebar" | "mobile";
}

export function MuscleReadinessWidget({
  recovery,
  variant = "sidebar",
}: MuscleReadinessWidgetProps) {
  const trained = recovery.filter((r) => r.state !== "untrained");
  if (trained.length === 0) {
    if (variant === "mobile") return null;
    return (
      <GlassCard className="flex flex-col items-center justify-center py-8 text-foreground/20">
        <Activity className="w-8 h-8 mb-2 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">
          No recovery data yet
        </span>
      </GlassCard>
    );
  }

  // Top 3 most recovered (trained only)
  const readiest = [...trained]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  // Most fatigued (lowest pct among trained)
  const mostFatigued = [...trained].sort((a, b) => a.pct - b.pct)[0];

  return (
    <GlassCard
      className={cn(
        "flex flex-col gap-4",
        variant === "mobile" && "min-w-[240px] flex-shrink-0 p-4",
      )}
    >
      <div>
        <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase mb-1">
          Muscle Readiness
        </p>
        <p className="text-[10px] text-foreground/20 mb-4 font-bold uppercase tracking-tight">
          Rolling 7 Days
        </p>

        {/* Top 3 ready */}
        <div className="space-y-2.5">
          {readiest.map((row) => (
            <div key={row.muscle} className="flex items-center gap-2.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[row.state])} />
              <span className="flex-1 text-[12px] font-semibold text-foreground truncate">
                {row.muscle}
              </span>
              {/* Mini bar */}
              <div className="h-1.5 w-14 rounded-full bg-foreground/10 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.pct}%`, backgroundColor: COLOR[row.state] }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-foreground/60 w-7 text-right shrink-0">
                {row.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Most fatigued divider */}
        {mostFatigued && mostFatigued.state !== "ready" && (
          <div className="mt-4 border-t border-foreground/[0.06] pt-3">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[mostFatigued.state])} />
              <span className="flex-1 text-[11px] text-foreground/40 truncate">
                {mostFatigued.muscle}
              </span>
              <span className="text-[11px] text-foreground/35 shrink-0">
                {fmtHours(mostFatigued.hoursLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-[9px] leading-relaxed text-foreground/25">
        Estimated. Not a medical measurement.
      </p>
    </GlassCard>
  );
}
