"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Dumbbell, Zap, Activity } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { MuscleRecovery, RecoveryState } from "@/types/workout";
import {
  REGION_TO_MUSCLES,
  leastRecovered,
  type BodyRegion,
} from "@/lib/muscles";
import dynamic from "next/dynamic";
import type { IExerciseData, IModelProps } from "react-body-highlighter";

const Model = dynamic(
  () => import("react-body-highlighter"),
  { ssr: false }
) as React.ComponentType<IModelProps>;


/* -------------------------------------------------------------------------- */
/*  Recovery state config                                                      */
/* -------------------------------------------------------------------------- */

const STATE_CONFIG: Record<
  RecoveryState,
  { label: string; color: string; dotClass: string }
> = {
  fatigued: { label: "Fatigued", color: "#ef4444", dotClass: "bg-red-500" },
  recovering: { label: "Recovering", color: "#fbbf24", dotClass: "bg-amber-400" },
  ready: { label: "Ready", color: "#34d399", dotClass: "bg-emerald-400" },
  untrained: { label: "Not trained", color: "transparent", dotClass: "bg-foreground/20" },
};

const STATE_FREQUENCY: Record<RecoveryState, number | null> = {
  fatigued: 1,
  recovering: 2,
  ready: 3,
  untrained: null,
};

const HIGHLIGHTED_COLORS = ["#ef4444", "#fbbf24", "#34d399"];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function fmtHours(h: number): string {
  if (h <= 0) return "Ready";
  if (h < 1) return "~30m";
  return `~${Math.round(h)}h`;
}

function fmtVol(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k kg` : `${Math.round(v)} kg`;
}

function relativeDate(iso: string | null): string {
  if (!iso) return "Never";
  try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }); }
  catch { return iso.slice(0, 10); }
}

function absoluteDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parseISO(iso));
  } catch { return iso.slice(0, 10); }
}

/* -------------------------------------------------------------------------- */
/*  Bottom sheet                                                               */
/* -------------------------------------------------------------------------- */

function BottomSheet({ muscle, onClose }: { muscle: MuscleRecovery; onClose: () => void }) {
  const cfg = STATE_CONFIG[muscle.state];
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl"
          initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-foreground/20" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("inline-flex h-2 w-2 rounded-full", cfg.dotClass)} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/40">{cfg.label}</span>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground">{muscle.muscle}</h3>
              </div>
              <button onClick={onClose} className="rounded-full border border-foreground/10 p-2 text-foreground/40 hover:text-foreground transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            {muscle.state !== "untrained" && (
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-foreground/40 uppercase tracking-widest">Estimated recovery</span>
                  <span className="text-[11px] font-bold tabular-nums text-foreground/70">{muscle.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cfg.color }}
                    initial={{ width: 0 }} animate={{ width: `${muscle.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-foreground/[0.07] bg-foreground/[0.02] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="h-3 w-3 text-foreground/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Last trained</span>
                </div>
                <p className="text-[13px] font-bold text-foreground">{relativeDate(muscle.lastTrainedAt)}</p>
                {muscle.lastTrainedAt && <p className="text-[11px] text-foreground/40 mt-0.5">{absoluteDate(muscle.lastTrainedAt)}</p>}
              </div>

              <div className="rounded-xl border border-foreground/[0.07] bg-foreground/[0.02] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3 text-foreground/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Ready in</span>
                </div>
                <p className={cn("text-[13px] font-bold", muscle.state === "ready" ? "text-emerald-400" : "text-foreground")}>
                  {fmtHours(muscle.hoursLeft)}
                </p>
              </div>

              <div className="rounded-xl border border-foreground/[0.07] bg-foreground/[0.02] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Dumbbell className="h-3 w-3 text-foreground/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Sets (last session)</span>
                </div>
                <p className="text-[13px] font-bold text-foreground">{muscle.lastSessionSets > 0 ? `${muscle.lastSessionSets} eff.` : "—"}</p>
              </div>

              <div className="rounded-xl border border-foreground/[0.07] bg-foreground/[0.02] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="h-3 w-3 text-foreground/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Volume (7d)</span>
                </div>
                <p className="text-[13px] font-bold text-foreground">{muscle.totalVolume7d > 0 ? fmtVol(muscle.totalVolume7d) : "—"}</p>
                {muscle.totalSets7d > 0 && <p className="text-[11px] text-foreground/40 mt-0.5">{muscle.totalSets7d} eff. sets</p>}
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-foreground/30">
              Estimated from training volume and time since your last session. Not a medical measurement.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

interface MuscleRecoveryMapProps {
  recovery: MuscleRecovery[];
}

export function MuscleRecoveryMap({ recovery }: MuscleRecoveryMapProps) {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");
  const [selected, setSelected] = useState<MuscleRecovery | null>(null);

  const recoveryMap = useMemo(() => new Map(recovery.map((r) => [r.muscle, r])), [recovery]);

  // Build react-body-highlighter data: pick worst muscle per region
  const bodyData = useMemo<IExerciseData[]>(() => {
    const entries: IExerciseData[] = [];
    for (const region of Object.keys(REGION_TO_MUSCLES) as BodyRegion[]) {
      const muscles = REGION_TO_MUSCLES[region];
      const worstMuscle = leastRecovered(muscles, recovery);
      if (!worstMuscle) continue;
      const row = recoveryMap.get(worstMuscle);
      if (row && row.state !== "untrained") {
        const freq = STATE_FREQUENCY[row.state];
        if (freq !== null) {
          entries.push({ name: region, muscles: [region], frequency: freq });
        }
      }
    }
    return entries;
  }, [recovery, recoveryMap]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRegionClick = useCallback((stats: any) => {
    const region = stats?.muscle as BodyRegion | undefined;
    if (!region) return;
    const muscles = REGION_TO_MUSCLES[region] ?? [];
    const worstMuscle = leastRecovered(muscles, recovery);
    if (!worstMuscle) return;
    const row = recoveryMap.get(worstMuscle);
    if (row) setSelected(row);
  }, [recovery, recoveryMap]);

  const sortedList = useMemo(() => {
    const order: Record<RecoveryState, number> = { fatigued: 0, recovering: 1, ready: 2, untrained: 3 };
    return [...recovery].sort((a, b) => {
      const d = order[a.state] - order[b.state];
      return d !== 0 ? d : a.pct - b.pct;
    });
  }, [recovery]);

  const trainedCount = recovery.filter((r) => r.state !== "untrained").length;

  return (
    <>
      <GlassCard className="flex flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/35">Estimated Recovery</p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-foreground">Muscle Readiness</h2>
          </div>
          <div className="flex rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] p-0.5">
            {(["anterior", "posterior"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-[10px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
                  view === v ? "bg-foreground/10 text-foreground shadow-sm" : "text-foreground/35 hover:text-foreground/60",
                )}
              >
                {v === "anterior" ? "Front" : "Back"}
              </button>
            ))}
          </div>
        </div>

        {/* Body map */}
        <div className="flex justify-center px-4 pb-2">
          <div className="w-full max-w-[280px] select-none">
            <Model
              type={view}
              data={bodyData}
              bodyColor="rgba(255,255,255,0.06)"
              highlightedColors={HIGHLIGHTED_COLORS}
              onClick={handleRegionClick}
              svgStyle={{ borderRadius: "1rem", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 px-5 pb-4 pt-1">
          {(["fatigued", "recovering", "ready", "untrained"] as RecoveryState[]).map((state) => {
            const cfg = STATE_CONFIG[state];
            return (
              <span key={state} className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground/50">
                <span className={cn("h-2 w-2 rounded-full", cfg.dotClass)} />
                {cfg.label}
              </span>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-foreground/[0.06] px-5 py-2">
          <p className="text-[10px] leading-relaxed text-foreground/30">
            Estimated from training volume and time since last session.
            {trainedCount > 0 && <> {trainedCount} of 16 muscles trained in the last 7 days.</>}
          </p>
        </div>
      </GlassCard>

      {/* Sorted muscle list */}
      <GlassCard className="flex flex-col gap-0 overflow-hidden p-0">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/35">Least Recovered First</p>
          <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-foreground">All Muscles</h2>
        </div>

        <div className="divide-y divide-foreground/[0.05]">
          {sortedList.map((row) => {
            const cfg = STATE_CONFIG[row.state];
            return (
              <button
                key={row.muscle}
                onClick={() => setSelected(row)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-foreground/[0.03] min-h-[44px]"
                aria-label={`${row.muscle}: ${cfg.label}${row.state !== "untrained" ? `, ${row.pct}%` : ""}`}
              >
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", cfg.dotClass)} />
                <span className="min-w-0 flex-1 text-[14px] font-semibold text-foreground">{row.muscle}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {row.state !== "untrained" ? (
                    <>
                      <div className="hidden sm:block h-1.5 w-16 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, backgroundColor: cfg.color }} />
                      </div>
                      <span className="text-[12px] font-bold tabular-nums text-foreground/70">{row.pct}%</span>
                      <span className="text-[11px] text-foreground/35 w-12 text-right">{row.hoursLeft > 0 ? fmtHours(row.hoursLeft) : "Ready"}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-foreground/30">Not trained</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {selected && <BottomSheet muscle={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
