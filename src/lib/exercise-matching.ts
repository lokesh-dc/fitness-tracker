import { getDb } from "@/lib/db-utils";
import { GeneratedDay, MatchedDay, MatchedExercise } from "@/types/workout";

const MUSCLE_GROUP_ALIASES: Record<string, string> = {
  "quads": "Quads", "quadricep": "Quads", "quad": "Quads", "quadriceps": "Quads",
  "hamstrings": "Hamstrings", "hamstring": "Hamstrings",
  "glutes": "Glutes", "glute": "Glutes", "gluteus": "Glutes",
  "calves": "Calves", "calve": "Calves", "calf": "Calves",
  "hips": "Glutes", "hip": "Glutes", "thigh": "Quads", "adductors": "Adductors", "adductor": "Adductors",
  "abs": "Abs", "abdominals": "Abs", "abdominal": "Abs", "core": "Abs",
  "obliques": "Obliques", "oblique": "Obliques",
  "arms": "Biceps", "bicep": "Biceps", "biceps": "Biceps",
  "tricep": "Triceps", "triceps": "Triceps",
  "forearm": "Forearms", "forearms": "Forearms",
  "pecs": "Chest", "pectoral": "Chest", "pec": "Chest", "chest": "Chest",
  "lats": "Lats", "lat": "Lats",
  "traps": "Traps", "trap": "Traps", "trapezius": "Traps",
  "upper back": "Upper Back", "lower back": "Lower Back",
  "back": "Upper Back", "shoulders": "Shoulders", "shoulder": "Shoulders",
  "delts": "Shoulders", "deltoid": "Shoulders", "cardio": "Cardio", "conditioning": "Cardio",
};

const VALID_MUSCLE_GROUPS = new Set([
  "Chest", "Lats", "Upper Back", "Lower Back", "Traps", "Shoulders",
  "Biceps", "Triceps", "Forearms", "Abs", "Obliques",
  "Quads", "Hamstrings", "Glutes", "Calves", "Adductors", "Cardio",
]);

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

function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return distance <= 1 ? 0.85 : 0;
  return 1 - distance / maxLen;
}

const TOKEN_MATCH_THRESHOLD = 0.75;

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
  if (aNorm === bNorm) return 1;
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 1;
  const charSimilarity = 1 - levenshteinDistance(aNorm, bNorm) / maxLen;
  return Math.max(charSimilarity, tokenSetSimilarity(tokenize(aNorm), tokenize(bNorm)));
}

interface DbExercise {
  id: string;
  name: string;
  muscleGroup: string;
  aliases?: string[];
}

async function getAllExercises(): Promise<DbExercise[]> {
  const db = await getDb();
  const exercises = await db
    .collection("Exercises")
    .find({})
    .project({ name: 1, muscleGroup: 1, aliases: 1 })
    .toArray();

  return exercises.map((ex) => ({
    id: ex._id.toString(),
    name: ex.name as string,
    muscleGroup: ex.muscleGroup as string,
    aliases: Array.isArray(ex.aliases) ? ex.aliases : [],
  }));
}

function filterCandidates(
  allExercises: DbExercise[],
  muscleGroup: string,
): DbExercise[] {
  const target = normalizeMuscleGroup(muscleGroup);
  const matched = allExercises.filter(
    (ex) => normalizeMuscleGroup(ex.muscleGroup) === target,
  );
  // If specific group has very few candidates, include all exercises to prevent false negatives
  return matched.length >= 3 ? matched : allExercises;
}

function matchAgainstCandidates(
  aiName: string,
  candidates: DbExercise[],
): { id: string; name: string; similarity: number }[] {
  const scored = candidates.map((c) => {
    const nameScore = similarity(aiName, c.name);
    let bestScore = nameScore;
    if (c.aliases && c.aliases.length > 0) {
      for (const alias of c.aliases) {
        const aliasScore = similarity(aiName, alias);
        if (aliasScore > bestScore) {
          bestScore = aliasScore;
        }
      }
    }
    return {
      id: c.id,
      name: c.name,
      similarity: bestScore,
    };
  });

  return scored.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Classifies an AI-generated exercise name against verified library candidates.
 * Always resolves to a real, verified database exercise to avoid database pollution.
 */
function classifyExercise(
  aiName: string,
  candidates: DbExercise[],
): {
  exerciseId: string;
  exerciseName: string;
} {
  if (candidates.length === 0) {
    return { exerciseId: "", exerciseName: aiName };
  }

  const scored = matchAgainstCandidates(aiName, candidates);
  const top = scored[0];

  return {
    exerciseId: top.id,
    exerciseName: top.name,
  };
}

export async function matchGeneratedExercises(
  days: GeneratedDay[],
): Promise<MatchedDay[]> {
  const allExercises = await getAllExercises();
  const muscleGroupCache = new Map<string, DbExercise[]>();

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

      // Map to the closest verified canonical exercise from the 799-exercise library.
      // ZERO database insertions occur here — prevents any hallucinated exercises from polluting MongoDB.
      const match = classifyExercise(ex.name, candidates);

      matchedExercises.push({
        aiName: ex.name,
        muscleGroup: normalizedGroup,
        targetSets: ex.targetSets,
        targetReps: typeof ex.targetReps === "number" ? ex.targetReps : parseInt(String(ex.targetReps), 10) || 10,
        restDuration: ex.restDuration || DEFAULT_REST_DURATION,
        exerciseId: match.exerciseId,
        exerciseName: match.exerciseName,
        needsUserReview: false,
        isNew: false,
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
