import { getDb } from "@/lib/db-utils";
import { GeneratedDay, MatchedDay, MatchedExercise } from "@/types/workout";

const MUSCLE_GROUP_ALIASES: Record<string, string> = {
  "quads": "Legs", "quadricep": "Legs", "quad": "Legs",
  "hamstrings": "Legs", "hamstring": "Legs",
  "glutes": "Legs", "glute": "Legs",
  "calves": "Legs", "calve": "Legs", "calf": "Legs",
  "hips": "Legs", "hip": "Legs", "thigh": "Legs",
  "abs": "Core", "abdominals": "Core", "abdominal": "Core", "obliques": "Core",
  "arms": "Biceps", "bicep": "Biceps", "biceps": "Biceps", "tricep": "Triceps", "triceps": "Triceps",
  "forearm": "Forearms", "forearms": "Forearms",
  "pecs": "Chest", "pectoral": "Chest", "pec": "Chest",
  "lats": "Back", "lat": "Back", "traps": "Back", "trap": "Back",
  "delts": "Shoulders", "deltoid": "Shoulders", "shoulder": "Shoulders",
  "cardio": "Cardio", "conditioning": "Cardio",
};

const VALID_MUSCLE_GROUPS = new Set([
  "Chest", "Back", "Shoulders", "Legs", "Biceps", "Triceps", "Forearms", "Core", "Cardio",
]);

const SIMILARITY_THRESHOLD = 0.8;
const REVIEW_GAP_THRESHOLD = 0.05;
const DEFAULT_REST_DURATION = 90;

function normalizeMuscleGroup(raw: string): string {
  const trimmed = raw.trim();
  if (VALID_MUSCLE_GROUPS.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  return MUSCLE_GROUP_ALIASES[lower] || trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[m][n];
}

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(name: string): string[] {
  return normalizeExerciseName(name).split(" ").filter(Boolean);
}

// Per-token fuzzy equality: tolerates a typo in short words (hit/hip) and
// minor spelling drift in longer ones (crunches/crunch, flyes/fly).
function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return distance <= 1 ? 0.85 : 0;
  return 1 - distance / maxLen;
}

const TOKEN_MATCH_THRESHOLD = 0.75;

// Order-insensitive, typo-tolerant token overlap. If every token of the AI
// name matches the library name, score 1.0 (the AI commonly omits equipment /
// descriptors that library names include, e.g. "Deadlift" vs "Deadlift (Barbell)").
// Otherwise use a Dice coefficient so distinguishing words (Standing vs Seated)
// keep a mismatch from being scored as identical.
function tokenSetSimilarity(aTokens: string[], bTokens: string[]): number {
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const used = new Array(bTokens.length).fill(false);
  let matched = 0;
  for (const word of aTokens) {
    let best = 0;
    let bestIdx = -1;
    for (let j = 0; j < bTokens.length; j++) {
      if (used[j]) continue;
      const s = tokenSimilarity(word, bTokens[j]);
      if (s > best) {
        best = s;
        bestIdx = j;
      }
    }
    if (best >= TOKEN_MATCH_THRESHOLD && bestIdx >= 0) {
      used[bestIdx] = true;
      matched++;
    }
  }
  if (matched === aTokens.length) return 1;
  return (2 * matched) / (aTokens.length + bTokens.length);
}

function similarity(a: string, b: string): number {
  const aNorm = normalizeExerciseName(a);
  const bNorm = normalizeExerciseName(b);
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 1;
  const charSimilarity = 1 - levenshteinDistance(aNorm, bNorm) / maxLen;
  return Math.max(charSimilarity, tokenSetSimilarity(tokenize(aNorm), tokenize(bNorm)));
}

// Custom exercises can be tagged with labels that aren't in the 9 canonical
// groups (e.g. "Glutes", "Calves"). Normalize the stored group and compare so
// a custom "Hip Thrust" under "Glutes" still surfaces for a "Legs" AI line.
async function getAllExercises(): Promise<
  { id: string; name: string; muscleGroup: string }[]
> {
  const db = await getDb();
  const exercises = await db
    .collection("Exercises")
    .find({})
    .project({ name: 1, muscleGroup: 1 })
    .toArray();

  return exercises.map((ex) => ({
    id: ex._id.toString(),
    name: ex.name as string,
    muscleGroup: ex.muscleGroup as string,
  }));
}

function filterCandidates(
  allExercises: { id: string; name: string; muscleGroup: string }[],
  muscleGroup: string,
): { id: string; name: string }[] {
  return allExercises
    .filter((ex) => normalizeMuscleGroup(ex.muscleGroup) === muscleGroup)
    .map((ex) => ({ id: ex.id, name: ex.name }));
}

function matchAgainstCandidates(
  aiName: string,
  candidates: { id: string; name: string }[],
): { id: string; name: string; similarity: number }[] {
  const scored = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    similarity: similarity(aiName, c.name),
  }));

  return scored.sort((a, b) => b.similarity - a.similarity);
}

function classifyExercise(
  aiName: string,
  candidates: { id: string; name: string }[],
): {
  exerciseId: string | null;
  exerciseName: string | null;
  needsUserReview: boolean;
  reviewCandidates?: { id: string; name: string; similarity: number }[];
  isNew: boolean;
} {
  if (candidates.length === 0) {
    return { exerciseId: null, exerciseName: null, needsUserReview: false, isNew: true };
  }

  const scored = matchAgainstCandidates(aiName, candidates);
  const top = scored[0];

  if (top.similarity >= SIMILARITY_THRESHOLD) {
    const runnerUp = scored[1];
    if (runnerUp && top.similarity - runnerUp.similarity < REVIEW_GAP_THRESHOLD) {
      const topCandidates = scored.slice(0, 3);
      return {
        exerciseId: null,
        exerciseName: null,
        needsUserReview: true,
        reviewCandidates: topCandidates,
        isNew: false,
      };
    }
    return {
      exerciseId: top.id,
      exerciseName: top.name,
      needsUserReview: false,
      isNew: false,
    };
  }

  if (top.similarity >= 0.5) {
    const topCandidates = scored.filter((s) => s.similarity >= 0.5).slice(0, 3);
    return {
      exerciseId: null,
      exerciseName: null,
      needsUserReview: true,
      reviewCandidates: topCandidates,
      isNew: false,
    };
  }

  return { exerciseId: null, exerciseName: null, needsUserReview: false, isNew: true };
}

export async function matchGeneratedExercises(
  days: GeneratedDay[],
): Promise<MatchedDay[]> {
  const allExercises = await getAllExercises();
  const muscleGroupCache = new Map<string, { id: string; name: string }[]>();

  const results: MatchedDay[] = [];

  for (const day of days) {
    const matchedExercises: MatchedExercise[] = [];

    for (const ex of day.exercises) {
      const normalizedGroup = normalizeMuscleGroup(ex.muscleGroup);

      let candidates = muscleGroupCache.get(normalizedGroup);
      if (!candidates) {
        candidates = filterCandidates(allExercises, normalizedGroup);
        muscleGroupCache.set(normalizedGroup, candidates);
      }

      const match = classifyExercise(ex.name, candidates);

      matchedExercises.push({
        aiName: ex.name,
        muscleGroup: normalizedGroup,
        targetSets: ex.targetSets,
        targetReps: typeof ex.targetReps === "number" ? ex.targetReps : parseInt(String(ex.targetReps), 10) || 10,
        restDuration: ex.restDuration || DEFAULT_REST_DURATION,
        exerciseId: match.exerciseId,
        exerciseName: match.exerciseName,
        needsUserReview: match.needsUserReview,
        reviewCandidates: match.reviewCandidates,
        isNew: match.isNew,
      });
    }

    results.push({
      dayOfWeek: day.dayOfWeek,
      name: day.name,
      rationale: day.rationale,
      exercises: matchedExercises,
    });
  }

  return results;
}
