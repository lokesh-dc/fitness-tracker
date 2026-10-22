"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUp, Plus, TrendingUp, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { type Exercise } from "@/types/workout";

export type PlateauProgression = "reps" | "sets";

type Props = {
  exercise: Exercise;
  onKeepSame: () => void;
  onApply: (progression: PlateauProgression) => void;
};

function weightLabel(weight: number) {
  return weight > 0 ? `${weight}kg` : "Same weight";
}

export default function PlateauModal({
  exercise,
  onKeepSame,
  onApply,
}: Props) {
  const unfinishedSets = exercise.sets.filter((set) => !set.completed);
  const firstUnfinished = unfinishedSets[0] || exercise.sets[0];
  const lastSet = exercise.sets[exercise.sets.length - 1];

  const currentSets = exercise.sets.length;
  const nextSets = currentSets + 1;

  const repWeight = firstUnfinished?.weight || exercise.lastWeight || 0;
  const currentReps = firstUnfinished?.reps || exercise.targetReps || 0;
  const nextReps = currentReps + 1;

  const setWeight = lastSet?.weight || exercise.lastWeight || 0;
  const setReps = lastSet?.reps || exercise.targetReps || 0;

  const [progression, setProgression] = useState<PlateauProgression>(
    currentReps >= 12 ? "sets" : "reps",
  );

  const preview =
    progression === "reps"
      ? `${weightLabel(repWeight)} · ${nextReps} reps × ${currentSets} sets`
      : `${weightLabel(setWeight)} · ${setReps} reps × ${nextSets} sets`;

  const detail =
    progression === "reps"
      ? "Adds one rep to each unfinished set and bumps the target."
      : "Adds one more working set at the same weight and reps.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plateau-modal-title"
      className="fixed inset-0 z-[60] m-0 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4"
      onClick={onKeepSame}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md sm:max-w-lg">
        <GlassCard className="max-h-[85vh] overflow-y-auto rounded-b-none rounded-t-3xl border-amber-400/20 px-5 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] pt-4 animate-in slide-in-from-bottom-6 duration-300 sm:rounded-3xl sm:p-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/15 sm:hidden" />
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3
                  id="plateau-modal-title"
                  className="text-sm font-black uppercase tracking-tight text-foreground">
                  Plateau detected
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                  {exercise.name}
                </p>
              </div>
            </div>
            <button
              onClick={onKeepSame}
              aria-label="Close plateau options"
              className="rounded-lg p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] font-medium leading-relaxed text-foreground/60">
            No progress in the last 3 weeks. Keep the same load, or nudge your
            volume to get the lift moving again.
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-foreground/5 bg-foreground/5 px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Current
            </span>
            <span className="text-[10px] font-bold text-foreground/60">
              {weightLabel(repWeight)} · {currentReps} reps × {currentSets} sets
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
              Progress with
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setProgression("reps")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-[10px] font-black uppercase tracking-widest transition-all",
                  progression === "reps"
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                    : "border-foreground/10 bg-foreground/5 text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
                )}>
                <TrendingUp className="h-4 w-4" />
                Add 1 rep
              </button>
              <button
                onClick={() => setProgression("sets")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-[10px] font-black uppercase tracking-widest transition-all",
                  progression === "sets"
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                    : "border-foreground/10 bg-foreground/5 text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
                )}>
                <Plus className="h-4 w-4" />
                Add 1 set
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/60">
                  Suggested next
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {preview}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                <ArrowUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="mt-2 text-[10px] font-medium leading-relaxed text-foreground/40">
              {detail}
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            <button
              onClick={() => onApply(progression)}
              className="w-full rounded-2xl bg-brand-primary px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all hover:scale-[1.02] active:scale-95">
              Apply +1 {progression === "reps" ? "rep" : "set"}
            </button>
            <button
              onClick={onKeepSame}
              className="w-full rounded-2xl border border-foreground/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground">
              Keep same weights × reps
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
