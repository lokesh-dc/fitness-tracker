type WarmupScheme = 'STRENGTH' | 'STRENGTH_HYPER' | 'HYPERTROPHY' | 'ENDURANCE';

interface WarmupSet {
  percentage: number;   // e.g. 30, 50, 70, 90
  weight: number;       // rounded calculated weight
  reps: number;         // suggested warm-up reps
  label: string;        // e.g. "30% — 30kg × 10"
}

interface WarmupResult {
  scheme: WarmupScheme;
  sets: WarmupSet[];
  workingWeight: number;
  workingReps: number;
}

const SCHEMES: Record<WarmupScheme, { pct: number; reps: number }[]> = {
  STRENGTH:       [{ pct: 0.30, reps: 10 }, { pct: 0.50, reps: 5 },
                   { pct: 0.70, reps: 3  }, { pct: 0.90, reps: 1 }],
  STRENGTH_HYPER: [{ pct: 0.40, reps: 8  }, { pct: 0.60, reps: 5 },
                   { pct: 0.80, reps: 2  }],
  HYPERTROPHY:    [{ pct: 0.50, reps: 8  }, { pct: 0.75, reps: 4 }],
  ENDURANCE:      [{ pct: 0.60, reps: 5  }],
};

function getWarmupScheme(reps: number): WarmupScheme {
  if (reps <= 5)  return 'STRENGTH';
  if (reps <= 10) return 'STRENGTH_HYPER';
  if (reps <= 15) return 'HYPERTROPHY';
  return 'ENDURANCE';
}

function parseReps(repsField?: string | number | null): number {
  if (typeof repsField === 'number') return repsField;
  if (!repsField || (typeof repsField === 'string' && repsField.toUpperCase() === 'AMRAP')) return 10;
  if (typeof repsField === 'string') {
    const match = repsField.match(/\d+/);
    return match ? parseInt(match[0]) : 10;
  }
  return 10;
}

function roundWeight(raw: number, unit: 'kg' | 'lbs'): number {
  const step = unit === 'kg' ? 0.5 : 1;
  return Math.round(raw / step) * step;
}

function generateWarmupSets(
  workingWeight: number,
  repsField?: string | number | null,
  unit: 'kg' | 'lbs' = 'kg'
): WarmupResult {
  const reps = parseReps(repsField);
  const scheme = getWarmupScheme(reps);
  
  const sets = SCHEMES[scheme].map(({ pct, reps: warmupReps }) => {
    const raw = workingWeight * pct;
    const weight = roundWeight(raw, unit);
    return {
      percentage: Math.round(pct * 100),
      weight,
      reps: warmupReps,
      label: `${Math.round(pct * 100)}% — ${weight}${unit} × ${warmupReps}`
    };
  });

  return { scheme, sets, workingWeight, workingReps: reps };
}

export { generateWarmupSets };
export type { WarmupResult, WarmupSet, WarmupScheme };
