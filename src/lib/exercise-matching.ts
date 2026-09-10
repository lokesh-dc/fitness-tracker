import { getDb } from "@/lib/db-utils";
import { GeneratedDay, MatchedDay, MatchedExercise } from "@/types/workout";

const MUSCLE_GROUP_ALIASES: Record<string, string> = {
  "quads": "Legs", "quadriceps": "Legs", "hamstrings": "Legs", "glutes": "Legs", "calves": "Legs",
  "abs": "Core", "abdominals": "Core", "obliques": "Core",
  "arms": "Biceps", "bicep": "Biceps", "tricep": "Triceps", "forearm": "Forearms",
  "pecs": "Chest", "pectoral": "Chest", "lats": "Back", "lat": "Back", "traps": "Back",
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

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

function normalizeExerciseName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*[-–]\s*.+/g, "")
    .toLowerCase()
    .trim();
}

async function findCandidates(
  muscleGroup: string,
): Promise<{ id: string; name: string }[]> {
  const db = await getDb();
  const exercises = await db
    .collection("Exercises")
    .find({ muscleGroup })
    .project({ name: 1 })
    .toArray();

  return exercises.map((ex) => ({
    id: ex._id.toString(),
    name: ex.name as string,
  }));
}

function matchAgainstCandidates(
  aiName: string,
  candidates: { id: string; name: string }[],
): { id: string; name: string; similarity: number }[] {
  const normalized = normalizeExerciseName(aiName);

  const scored = candidates.map((c) => {
    const candNormalized = normalizeExerciseName(c.name);
    const score = Math.max(
      similarity(normalized, candNormalized),
      similarity(aiName.toLowerCase(), c.name.toLowerCase()),
    );
    return { id: c.id, name: c.name, similarity: score };
  });

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
  const muscleGroupCache = new Map<string, { id: string; name: string }[]>();

  const results: MatchedDay[] = [];

  for (const day of days) {
    const matchedExercises: MatchedExercise[] = [];

    for (const ex of day.exercises) {
      const normalizedGroup = normalizeMuscleGroup(ex.muscleGroup);

      let candidates = muscleGroupCache.get(normalizedGroup);
      if (!candidates) {
        candidates = await findCandidates(normalizedGroup);
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
