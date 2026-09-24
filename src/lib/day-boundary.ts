/**
 * Canonical day handling for the whole app.
 *
 * The client always sends the user's calendar day as a `yyyy-MM-dd` string
 * (see WorkoutSession `effectiveDate`). `new Date("yyyy-MM-dd")` already parses
 * to UTC midnight — that instant IS the canonical storage for the day.
 *
 * Previously the code re-anchored with `setHours(0, 0, 0, 0)`, which uses the
 * SERVER's local timezone and silently shifted stored days (IST midnight =
 * previous day 18:30 UTC). That split WorkoutLog dates and ExerciseRecords
 * prDate/history across two different UTC days and broke every UTC-day
 * comparison in the history tab (PR markers never matched their log rows).
 *
 * Rule: day-keys are ALWAYS UTC midnight. Use these helpers instead of
 * setHours for anything stored in or queried from the DB. Day-string
 * comparisons must use toUTCDayString (UTC), never toDateString (local).
 */
export function toUTCStartOfDay(input?: string | Date): Date {
  const raw = input !== undefined ? new Date(input as string) : new Date();
  const base = isNaN(raw.getTime()) ? new Date() : raw;
  // Local calendar components -> canonical UTC-midnight storage. For a
  // `yyyy-MM-dd` string this is a no-op (already UTC midnight); for full
  // timestamps it pins the server-local calendar day as a UTC instant.
  return new Date(
    Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()),
  );
}

export function toUTCEndOfDay(input?: string | Date): Date {
  const start = toUTCStartOfDay(input);
  return new Date(start.getTime() + 86399999);
}

export function toUTCDayString(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toISOString().split("T")[0];
}

export function toLocalDayString(input: Date | string): string {
  const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
