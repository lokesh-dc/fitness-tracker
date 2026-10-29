/**
 * Single source of truth for the muscle taxonomy.
 *
 * Every muscle name in the app comes from `MUSCLES`. The only non-muscle
 * exercise category we keep is `Cardio` — it is deliberately outside the
 * muscle taxonomy because it has no single muscle to recover.
 */

export const MUSCLES = [
  "Chest",
  "Lats",
  "Upper Back",
  "Lower Back",
  "Traps",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Abs",
  "Obliques",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Adductors",
] as const;

export type Muscle = (typeof MUSCLES)[number];

export type MuscleParent = "Push" | "Pull" | "Legs" | "Core";

/** Coarse roll-up for widgets that intentionally stay at Push/Pull/Legs/Core. */
export const MUSCLE_PARENT: Record<Muscle, MuscleParent> = {
  Chest: "Push",
  Shoulders: "Push",
  Triceps: "Push",
  Lats: "Pull",
  "Upper Back": "Pull",
  "Lower Back": "Pull",
  Traps: "Pull",
  Biceps: "Pull",
  Forearms: "Pull",
  Abs: "Core",
  Obliques: "Core",
  Quads: "Legs",
  Hamstrings: "Legs",
  Glutes: "Legs",
  Calves: "Legs",
  Adductors: "Legs",
};

export const MUSCLE_PARENTS: MuscleParent[] = ["Push", "Pull", "Legs", "Core"];

/** A secondary set counts as half a set for recovery load. */
export const SECONDARY_WEIGHT = 0.5;

/** Secondary muscles are capped so a single compound lift cannot light up the body. */
export const MAX_SECONDARY_MUSCLES = 3;

/**
 * Values that existed before the taxonomy upgrade. These are only used for
 * rendering legacy data and for the one-off migration script; new writes must
 * use a canonical `Muscle`.
 */
const LEGACY_ALIASES: Record<string, string> = {
  back: "Lats",
  lat: "Lats",
  lats: "Lats",
  "upper back": "Upper Back",
  upperback: "Upper Back",
  "lower back": "Lower Back",
  lowerback: "Lower Back",
  trap: "Traps",
  traps: "Traps",
  trapezius: "Traps",
  shoulder: "Shoulders",
  shoulders: "Shoulders",
  delt: "Shoulders",
  delts: "Shoulders",
  deltoid: "Shoulders",
  deltoids: "Shoulders",
  bicep: "Biceps",
  biceps: "Biceps",
  tricep: "Triceps",
  triceps: "Triceps",
  forearm: "Forearms",
  forearms: "Forearms",
  abs: "Abs",
  ab: "Abs",
  abdominals: "Abs",
  abdominal: "Abs",
  core: "Abs",
  oblique: "Obliques",
  obliques: "Obliques",
  quad: "Quads",
  quads: "Quads",
  quadricep: "Quads",
  quadriceps: "Quads",
  hamstring: "Hamstrings",
  hamstrings: "Hamstrings",
  glute: "Glutes",
  glutes: "Glutes",
  gluteal: "Glutes",
  calf: "Calves",
  calves: "Calves",
  adductor: "Adductors",
  adductors: "Adductors",
  arms: "Biceps",
  arm: "Biceps",
  chest: "Chest",
  pecs: "Chest",
  pectoral: "Chest",
  pectorals: "Chest",
  cardio: "Cardio",
  conditioning: "Cardio",
  other: "Other",
};

const MUSCLE_SET = new Set<string>(MUSCLES);

export function isMuscle(value: string): value is Muscle {
  return MUSCLE_SET.has(value);
}

/**
 * Normalizes a stored value to a canonical muscle. Returns null for values
 * that are not muscles (Cardio, Other, unknown custom tags).
 */
export function normalizeMuscle(value: string): Muscle | null {
  if (isMuscle(value)) return value;
  const key = value.trim().toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
  const alias = LEGACY_ALIASES[key];
  return alias && isMuscle(alias) ? alias : null;
}

export function muscleParent(value: string): MuscleParent | null {
  const muscle = normalizeMuscle(value);
  return muscle ? MUSCLE_PARENT[muscle] : null;
}

/**
 * Coarse groups used by the illustrated body map in the workout picker. This
 * is a *visual* grouping, not the analytics taxonomy: Lats/Upper Back/Lower
 * Back/Traps share the drawn back region, and all five leg muscles share the
 * drawn legs region.
 */
export type BodyMapGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Core"
  | "Legs"
  | "Cardio"
  | "Other";

const BODY_MAP_GROUP: Record<Muscle, BodyMapGroup> = {
  Chest: "Chest",
  Lats: "Back",
  "Upper Back": "Back",
  "Lower Back": "Back",
  Traps: "Back",
  Shoulders: "Shoulders",
  Biceps: "Biceps",
  Triceps: "Triceps",
  Forearms: "Forearms",
  Abs: "Core",
  Obliques: "Core",
  Quads: "Legs",
  Hamstrings: "Legs",
  Glutes: "Legs",
  Calves: "Legs",
  Adductors: "Legs",
};

export function bodyMapGroup(value: string): BodyMapGroup {
  const muscle = normalizeMuscle(value);
  if (muscle) return BODY_MAP_GROUP[muscle];
  const lower = value.trim().toLowerCase();
  if (lower === "cardio" || lower === "conditioning") return "Cardio";
  return "Other";
}

/**
 * Sanitizes a secondary-muscle selection: canonical muscles only, the primary
 * is removed, duplicates collapse, and the list is capped at 3.
 */
export function sanitizeSecondaryMuscles(
  primary: string,
  values: readonly string[],
): Muscle[] {
  const seen = new Set<Muscle>();
  for (const value of values) {
    const muscle = normalizeMuscle(value);
    if (!muscle || muscle === primary || seen.has(muscle)) continue;
    seen.add(muscle);
    if (seen.size >= MAX_SECONDARY_MUSCLES) break;
  }
  return Array.from(seen);
}

/* ------------------------------------------------------------------------- */
/* Body-map library mapping (react-body-highlighter regions)                  */
/* ------------------------------------------------------------------------- */

export const BODY_REGIONS = [
  "chest",
  "upper-back",
  "lower-back",
  "trapezius",
  "front-deltoids",
  "back-deltoids",
  "biceps",
  "triceps",
  "forearm",
  "abs",
  "obliques",
  "quadriceps",
  "hamstring",
  "gluteal",
  "calves",
  "adductor",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

export const MUSCLE_TO_REGIONS: Record<Muscle, BodyRegion[]> = {
  Chest: ["chest"],
  Lats: ["upper-back"],
  "Upper Back": ["upper-back"],
  "Lower Back": ["lower-back"],
  Traps: ["trapezius"],
  Shoulders: ["front-deltoids", "back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Forearms: ["forearm"],
  Abs: ["abs"],
  Obliques: ["obliques"],
  Quads: ["quadriceps"],
  Hamstrings: ["hamstring"],
  Glutes: ["gluteal"],
  Calves: ["calves"],
  Adductors: ["adductor"],
};

export const REGION_TO_MUSCLES = BODY_REGIONS.reduce(
  (acc, region) => {
    acc[region] = (MUSCLES as readonly Muscle[]).filter((muscle) =>
      MUSCLE_TO_REGIONS[muscle].includes(region),
    );
    return acc;
  },
  {} as Record<BodyRegion, Muscle[]>,
);

/**
 * Lats and Upper Back share the `upper-back` region. When both are trained we
 * paint the least recovered one, because that is the actionable information.
 */
export function leastRecovered(
  muscles: readonly Muscle[],
  recovery: { muscle: Muscle; pct: number; state: string }[],
): Muscle | null {
  const rows = recovery.filter((row) => muscles.includes(row.muscle));
  if (rows.length === 0) return muscles[0] ?? null;

  const rank = (state: string, pct: number) => {
    if (state === "fatigued") return pct;
    if (state === "recovering") return 100 + pct;
    if (state === "ready") return 300;
    return 400;
  };

  return rows.reduce((worst, row) =>
    rank(row.state, row.pct) < rank(worst.state, worst.pct) ? row : worst,
  ).muscle;
}
