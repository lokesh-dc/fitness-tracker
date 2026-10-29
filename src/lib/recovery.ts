import type { Muscle } from "./muscles";
import type { MuscleRecovery, RecoveryState } from "@/types/workout";

/**
 * Hours to full recovery after a "normal" session (5-9 effective sets).
 *
 * These are deliberately conservative, general-purpose heuristics. They are
 * an estimate from training volume and time since the last session — not a
 * medical measurement.
 */
export const BASE_HOURS: Record<Muscle, number> = {
  Chest: 60,
  Lats: 60,
  "Upper Back": 48,
  "Lower Back": 72,
  Traps: 48,
  Shoulders: 48,
  Biceps: 36,
  Triceps: 36,
  Forearms: 24,
  Abs: 24,
  Obliques: 24,
  Quads: 72,
  Hamstrings: 72,
  Glutes: 60,
  Calves: 36,
  Adductors: 48,
};

/** More sets take longer; very light sessions recover faster. */
export const loadFactor = (effSets: number): number =>
  effSets <= 4 ? 0.8 : effSets <= 9 ? 1 : 1.25;

export function recoveryWindowHours(muscle: Muscle, effSets: number): number {
  return BASE_HOURS[muscle] * loadFactor(effSets);
}

export function computeRecovery(
  muscle: Muscle,
  last: Date,
  effSets: number,
  now = Date.now(),
): { pct: number; hoursLeft: number } {
  const windowHours = recoveryWindowHours(muscle, effSets);
  const hoursSince = (now - +last) / 36e5;

  return {
    // A future timestamp (clock skew) must never produce a negative recovery.
    pct: Math.max(0, Math.min(100, (hoursSince / windowHours) * 100)),
    hoursLeft: Math.max(0, windowHours - hoursSince),
  };
}

export const stateFromPct = (pct: number): RecoveryState =>
  pct >= 100 ? "ready" : pct >= 50 ? "recovering" : "fatigued";

/**
 * Full estimate for one muscle. Returns `untrained` when there is no session
 * in the window (or the session had no effective sets).
 */
export function recoveryForMuscle(
  muscle: Muscle,
  lastTrainedAt: Date | null,
  effSets: number,
  now = Date.now(),
): Pick<MuscleRecovery, "state" | "pct" | "hoursLeft"> {
  if (!lastTrainedAt || effSets <= 0) {
    return { state: "untrained", pct: 0, hoursLeft: 0 };
  }

  const { pct: rawPct, hoursLeft } = computeRecovery(
    muscle,
    lastTrainedAt,
    effSets,
    now,
  );
  const pct = Math.round(rawPct);

  return {
    state: stateFromPct(pct),
    pct,
    hoursLeft: stateFromPct(pct) === "ready" ? 0 : Math.ceil(hoursLeft),
  };
}
