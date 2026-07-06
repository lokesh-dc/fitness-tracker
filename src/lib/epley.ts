/**
 * Epley formula: weight × (1 + reps / 30)
 * Returns null if weight <= 0 or reps <= 0
 * If reps === 1, returns weight directly (actual 1RM, no estimation needed)
 */
export function calculateEpley(weight: number, reps: number): number | null {
  if (weight <= 0 || reps <= 0) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10; // round to 1 decimal
}

/**
 * Given an array of sets, returns the highest estimated 1RM across all sets.
 * Also returns the set it was based on for display purposes.
 */
export function bestEpleyFromSets(
  sets: { weight: number | string; reps: number | string }[]
): { estimated1RM: number; basedOn: { weight: number; reps: number } } | null {
  const valid = sets
    .map(s => {
      const weight = parseFloat(String(s.weight));
      const reps = parseInt(String(s.reps), 10);
      return { weight, reps };
    })
    .filter(s => s.weight > 0 && s.reps > 0);

  if (valid.length === 0) return null;

  let best: { estimated1RM: number; basedOn: { weight: number; reps: number } } | null = null;

  for (const set of valid) {
    const est = calculateEpley(set.weight, set.reps);
    if (est !== null && (best === null || est > best.estimated1RM)) {
      best = { estimated1RM: est, basedOn: { weight: set.weight, reps: set.reps } };
    }
  }

  return best;
}
