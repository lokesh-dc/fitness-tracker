import { getGroqModel } from "@/lib/ai";
import { Goal, ExperienceLevel, Equipment, GeneratedProgram, GeneratedProgramResult } from "@/types/workout";
import { buildProgramPrompt } from "./program-prompt";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const VALID_MUSCLE_GROUPS = new Set([
  "Chest", "Back", "Shoulders", "Legs", "Biceps", "Triceps", "Forearms", "Core", "Cardio",
]);

function cleanAiResponse(content: string): string {
  let cleaned = content.replace(/ thinking[\s\S]*?<\/think>/g, "").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();
  return cleaned;
}

interface RawTextExercise {
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  restDuration: number;
}

interface RawTextDay {
  dayOfWeek: number;
  name: string;
  rationale: string;
  exercises: RawTextExercise[];
}

function firstInt(value: string, fallback: number): number {
  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
}

function parseExerciseLine(line: string): RawTextExercise | null {
  const body = line.replace(/^\[EXERCISE\]\s*/i, "").trim();
  const parts = body.split("|").map((p) => p.trim());
  if (parts.length < 4) return null;
  const [name, muscleGroup, sets, reps, rest = "90"] = parts;
  if (!name || !muscleGroup) return null;
  return {
    name,
    muscleGroup,
    targetSets: firstInt(sets, 3),
    targetReps: firstInt(reps, 10),
    restDuration: firstInt(rest, 90),
  };
}

export type ParsedProgramText =
  | { ok: true; data: { days: RawTextDay[] } }
  | { ok: false; error: string };

export function parseProgramText(
  content: string,
): ParsedProgramText {
  const lines = content.split(/\r?\n/);
  const rawDays: RawTextDay[] = [];
  let currentDay: RawTextDay | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const dayMatch = line.match(/^\[DAY\]\s*(\d)\s*\|\s*(.+)$/i);
    if (dayMatch) {
      const dayOfWeek = Number(dayMatch[1]);
      if (dayOfWeek < 0 || dayOfWeek > 6) continue;
      currentDay = {
        dayOfWeek,
        name: dayMatch[2].trim() || "Workout",
        rationale: "",
        exercises: [],
      };
      rawDays.push(currentDay);
      continue;
    }

    const rationaleMatch = line.match(/^\[RATIONALE\]\s*(.+)$/i);
    if (rationaleMatch) {
      if (currentDay && !currentDay.rationale) {
        currentDay.rationale = rationaleMatch[1].trim();
      }
      continue;
    }

    if (line.match(/^\[EXERCISE\]/i) && currentDay) {
      const exercise = parseExerciseLine(line);
      if (exercise) currentDay.exercises.push(exercise);
    }
  }

  const days = rawDays.filter((d) => d.exercises.length > 0);

  if (days.length === 0) {
    return {
      ok: false,
      error: "AI did not return a recognizable program. Please try again.",
    };
  }

  return { ok: true, data: { days } };
}

function tryExtractJson(content: string): unknown | null {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

interface ExerciseRecord extends Record<string, unknown> {
  name: string;
}

function isExerciseRecord(value: unknown): value is ExerciseRecord {
  return isRecord(value) && typeof value.name === "string" && value.name.trim().length > 0;
}

function clampSets(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 3;
  return Math.min(8, Math.max(1, Math.round(n)));
}

function parseReps(value: unknown): number {
  if (typeof value === "number") return Math.min(30, Math.max(1, Math.round(value)));
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    if (match) return Math.min(30, Math.max(1, parseInt(match[1], 10)));
  }
  return 10;
}

function clampRest(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 10) return 90;
  return Math.min(300, Math.max(30, Math.round(n)));
}

function normalizeMuscleGroup(raw: string): string {
  const trimmed = raw.trim();
  if (VALID_MUSCLE_GROUPS.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  const aliasMap: Record<string, string> = {
    "quads": "Legs", "quadriceps": "Legs", "hamstrings": "Legs", "glutes": "Legs", "calves": "Legs",
    "abs": "Core", "abdominals": "Core", "obliques": "Core",
    "arms": "Biceps", "bicep": "Biceps", "tricep": "Triceps", "forearm": "Forearms",
    "pecs": "Chest", "pectoral": "Chest", "lats": "Back", "lat": "Back", "traps": "Back",
    "delts": "Shoulders", "deltoid": "Shoulders", "shoulder": "Shoulders",
    "cardio": "Cardio", "conditioning": "Cardio",
  };
  return aliasMap[lower] || trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function validateAndCleanProgram(
  raw: unknown,
  expectedDays: number,
): GeneratedProgramResult {
  if (!isRecord(raw) || !Array.isArray(raw.days)) {
    return { success: false, error: "Invalid response format: missing 'days' array." };
  }

  const rawDays = raw.days;

  if (rawDays.length === 0) {
    return { success: false, error: "No days generated." };
  }

  const dayOfWeekSet = new Set<number>();
  const cleanedDays: GeneratedProgram["days"] = [];

  for (const rawDay of rawDays) {
    if (!isRecord(rawDay)) continue;

    const dayOfWeek = Number(rawDay.dayOfWeek);
    if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) continue;
    if (dayOfWeekSet.has(dayOfWeek)) continue;
    dayOfWeekSet.add(dayOfWeek);

    const name = typeof rawDay.name === "string" && rawDay.name.trim()
      ? rawDay.name.trim()
      : "Workout";

    const rationale = typeof rawDay.rationale === "string" ? rawDay.rationale.trim() : "";

    const exercises = Array.isArray(rawDay.exercises)
      ? rawDay.exercises
          .filter(isExerciseRecord)
          .map((ex) => ({
            name: ex.name.trim(),
            muscleGroup: normalizeMuscleGroup(typeof ex.muscleGroup === "string" ? ex.muscleGroup : "Other"),
            targetSets: clampSets(ex.targetSets),
            targetReps: parseReps(ex.targetReps),
            restDuration: clampRest(ex.restDuration),
          }))
      : [];

    if (exercises.length === 0) continue;

    cleanedDays.push({ dayOfWeek, name, rationale, exercises });
  }

  if (cleanedDays.length === 0) {
    return { success: false, error: "No valid days with exercises found in response." };
  }

  if (cleanedDays.length !== expectedDays) {
    console.error(
      `Expected ${expectedDays} days but got ${cleanedDays.length}. Rejecting generation.`,
    );
    return {
      success: false,
      error: `AI returned ${cleanedDays.length} days instead of ${expectedDays}. Please try again.`,
    };
  }

  return { success: true, program: { days: cleanedDays } };
}

export async function generateProgram(input: {
  goal: Goal;
  daysPerWeek: number;
  equipment: Equipment[];
  experienceLevel: ExperienceLevel;
  weeksCount: number;
}): Promise<GeneratedProgramResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return { success: false, error: "AI service is not configured. Please try again later." };
  }

  const model = getGroqModel();
  if (!model) {
    return { success: false, error: "AI model is not configured. Please try again later." };
  }

  const prompt = buildProgramPrompt(input);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content:
              "You are a professional strength and conditioning coach. Respond ONLY in the exact tagged plain-text format requested ([DAY], [RATIONALE], [EXERCISE] lines). Never output JSON, markdown, code blocks, bullets, or commentary.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Groq API error (program generation):", response.status, await response.text().catch(() => ""));
      return { success: false, error: "AI service returned an error. Please try again." };
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { success: false, error: "AI returned an empty response. Please try again." };
    }

    const cleaned = cleanAiResponse(content);

    // Primary path: parse the tagged plain-text format (more robust than raw JSON).
    const textParsed = parseProgramText(cleaned);
    if (textParsed.ok) {
      return validateAndCleanProgram(textParsed.data, input.daysPerWeek);
    }

    // Fallback: if the model ignored instructions and emitted JSON anyway, extract it.
    const jsonData = tryExtractJson(cleaned);
    if (jsonData !== null) {
      return validateAndCleanProgram(jsonData, input.daysPerWeek);
    }

    console.error("Failed to parse AI program response. Raw:", cleaned.slice(0, 500));
    return { success: false, error: textParsed.error };
  } catch (error) {
    console.error("Error calling AI for program generation:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
