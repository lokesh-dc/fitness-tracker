import { GlassCard } from "@/components/ui/GlassCard";
import type { MuscleRecovery, RecoveryState } from "@/types/workout";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

const DOT_CLASS: Record<RecoveryState, string> = {
  fatigued: "bg-red-500",
  recovering: "bg-amber-400",
  ready: "bg-emerald-400",
  untrained: "bg-foreground/15",
};

const BAR_COLOR: Record<RecoveryState, string> = {
  fatigued: "#ef4444",
  recovering: "#fbbf24",
  ready: "#34d399",
  untrained: "transparent",
};

const STATE_LABEL: Record<RecoveryState, string> = {
  fatigued: "Fatigued",
  recovering: "Recovering",
  ready: "Ready",
  untrained: "Not trained",
};

function fmtHours(h: number): string {
  if (h <= 0) return "Ready now";
  if (h < 1) return "~30m";
  return `~${Math.round(h)}h`;
}

interface MuscleRecoveryDashCardProps {
  recovery: MuscleRecovery[];
  isFirstWorkoutUser?: boolean;
}

export function MuscleRecoveryDashCard({
  recovery,
  isFirstWorkoutUser = false,
}: MuscleRecoveryDashCardProps) {
  const trained = recovery.filter((r) => r.state !== "untrained");

  // Empty state — subtle, non-intrusive
  if (trained.length === 0) {
    return (
      <Link href="/analytics#muscle-recovery" className="block">
        <GlassCard className="relative overflow-hidden flex items-center gap-4 border-foreground/5 bg-foreground/[0.02] group">
          <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-foreground/25" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground/50">Muscle Recovery</p>
            <p className="text-xs text-foreground/30 mt-0.5">
              {isFirstWorkoutUser
                ? "Train a muscle to see recovery here"
                : "Log a workout to see recovery status"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground/15 group-hover:text-foreground/40 transition-colors shrink-0" />
        </GlassCard>
      </Link>
    );
  }

  // Sort: least recovered first (fatigued → recovering → ready)
  const order: Record<RecoveryState, number> = { fatigued: 0, recovering: 1, ready: 2, untrained: 3 };
  const sorted = [...trained].sort((a, b) => {
    const d = order[a.state] - order[b.state];
    return d !== 0 ? d : a.pct - b.pct;
  });

  // Show top 4: up to 3 most fatigued/recovering + most ready (if different)
  const preview = sorted.slice(0, 4);

  // Summary counts
  const readyCount = trained.filter((r) => r.state === "ready").length;
  const fatiguedCount = trained.filter((r) => r.state === "fatigued").length;
  const recoveringCount = trained.filter((r) => r.state === "recovering").length;

  return (
    <Link href="/analytics#muscle-recovery" className="block group">
      <GlassCard className="flex flex-col gap-4 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-foreground/35">
                Muscle Recovery
              </p>
              <p className="text-[10px] text-foreground/25 font-medium leading-none mt-0.5">
                Rolling 7 days · Estimated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Summary pills */}
            {fatiguedCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {fatiguedCount}
              </span>
            )}
            {recoveringCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {recoveringCount}
              </span>
            )}
            {readyCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {readyCount}
              </span>
            )}
          </div>
        </div>

        {/* Muscle rows */}
        <div className="px-4 space-y-2.5">
          {preview.map((row) => (
            <div key={row.muscle} className="flex items-center gap-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[row.state]}`} />
              <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                {row.muscle}
              </span>
              {/* Progress bar */}
              <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.pct}%`,
                    backgroundColor: BAR_COLOR[row.state],
                  }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-foreground/50 w-10 text-right shrink-0">
                {row.state === "ready" ? "Ready" : fmtHours(row.hoursLeft)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between border-t border-foreground/[0.06] px-4 py-3">
          <p className="text-[10px] text-foreground/25">
            {STATE_LABEL.untrained !== "untrained" && trained.length < 16
              ? `${16 - trained.length} muscles not trained this week`
              : `${trained.length} of 16 muscles tracked`}
          </p>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary/60 group-hover:text-brand-primary transition-colors">
            Full map
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </GlassCard>
    </Link>
  );
}
