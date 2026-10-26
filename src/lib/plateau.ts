/**
 * Shared plateau detection for the live workout screen and the mobile setup API.
 *
 * Total volume is deliberately not used: changing the number of sets or the
 * rep range makes volume swing wildly even when the athlete keeps adding
 * weight. Instead, a session is considered progress when it beats the previous
 * session on either max weight or estimated 1RM. Using e1RM (rather than raw
 * reps) stops a lighter, higher-rep session from masking a stalled lift.
 */

export const PLATEAU_SESSION_COUNT = 3;
// Three weeks plus a week of scheduling tolerance (missed sessions, holidays,
// etc). The badge still describes this as roughly three weeks.
export const PLATEAU_WINDOW_DAYS = 28;

const DAY_MS = 24 * 60 * 60 * 1000;

export type PlateauSession = {
  /** Date the session was logged. */
  date: Date | string;
  /** Heaviest weight used in the session. */
  maxWeight: number;
  /** Best Epley estimated 1RM across all sets in the session. */
  estimated1RM: number;
};

function improved(
  current: PlateauSession,
  previous: PlateauSession,
): boolean {
  // Progress means adding weight, or improving estimated 1RM (which captures
  // adding reps at the same weight). A lighter, higher-rep session does not
  // count unless it actually raises e1RM.
  return (
    current.maxWeight > previous.maxWeight ||
    current.estimated1RM > previous.estimated1RM
  );
}

function toDayStamp(date: Date | string): number {
  const parsed = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(parsed.getTime())) return NaN;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Returns true when the last three sessions show no improvement and fall
 * inside the recent plateau window.
 *
 * `sessions` must be ordered newest first and contain only sessions with at
 * least one valid (weight > 0, reps > 0) set.
 */
export function detectPlateau(
  sessions: PlateauSession[],
  now: Date = new Date(),
): boolean {
  if (sessions.length < PLATEAU_SESSION_COUNT) return false;

  const recent = sessions.slice(0, PLATEAU_SESSION_COUNT);
  const newest = toDayStamp(recent[0].date);
  const oldest = toDayStamp(recent[recent.length - 1].date);
  const today = toDayStamp(now);

  if (!Number.isFinite(newest) || !Number.isFinite(oldest)) return false;

  const windowMs = PLATEAU_WINDOW_DAYS * DAY_MS;

  // Don't flag stale data from months ago when the exercise is picked up again.
  if (today - newest > windowMs) return false;

  // All three sessions need to fit inside the plateau window.
  if (newest - oldest > windowMs) return false;

  return (
    !improved(recent[0], recent[1]) &&
    !improved(recent[1], recent[2])
  );
}
