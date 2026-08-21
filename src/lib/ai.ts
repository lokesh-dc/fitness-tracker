import { Exercise, PRHit, WorkoutTemplate } from "@/types/workout";
import { EXERCISE_LIST } from "@/lib/exercises";

interface WorkoutSummaryInput {
  splitName?: string;
  exercises: Exercise[];
  durationSeconds?: number;
  prsHit: PRHit[];
  bodyWeight?: number;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL = "qwen/qwen3.6-27b";

export function getGroqModel(): string | null {
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  if (!model || model === "your_groq_model_here") return null;
  return model;
}

function getExerciseUnit(ex: Exercise): string {
  return (ex as any).unit || "kg";
}

function getSessionUnit(exercises: Exercise[]): string | null {
  const units = new Set(exercises.map(getExerciseUnit));
  return units.size === 1 ? (units.values().next().value as string) : null;
}

function calcTotalVolume(exercises: Exercise[]): number {
  return exercises.reduce(
    (total, ex) =>
      total + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0),
    0,
  );
}

function findHeaviestSet(
  exercises: Exercise[],
): { exerciseName: string; weight: number; reps: number } | null {
  let heaviest: { exerciseName: string; weight: number; reps: number } | null = null;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      const weight = set.weight || 0;
      if (!heaviest || weight > heaviest.weight) {
        heaviest = { exerciseName: ex.name, weight, reps: set.reps || 0 };
      }
    }
  }
  return heaviest;
}

function resolveMuscleGroupVolumes(exercises: Exercise[]): { group: string; volume: number }[] {
  const allGroups = Object.keys(EXERCISE_LIST) as (keyof typeof EXERCISE_LIST)[];
  const volumeByGroup = new Map<string, number>();

  for (const ex of exercises) {
    const group = allGroups.find((g) => EXERCISE_LIST[g].includes(ex.name));
    if (!group) continue;
    const exVolume = ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
    volumeByGroup.set(group, (volumeByGroup.get(group) || 0) + exVolume);
  }

  return Array.from(volumeByGroup.entries())
    .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
    .sort((a, b) => b.volume - a.volume);
}

function buildPrompt(input: WorkoutSummaryInput): string {
  const { splitName, exercises, prsHit, bodyWeight } = input;
  const muscleVolumes = resolveMuscleGroupVolumes(exercises);
  const sessionUnit = getSessionUnit(exercises);
  const totalVolume = calcTotalVolume(exercises);
  const heaviest = findHeaviestSet(exercises);

  const lines = [
    "You are a professional strength & conditioning coach. Recommend a cool-down for the completed workout below.",
    "",
    // Part 1 — Summary (disabled: we only want cool-down output now)
    // "Part 1 — Summary (3-5 sentences, punchy and specific):",
    // "- Reference at least two concrete numbers from the data below (total volume, heaviest set, duration, or a PR).",
    // "- Do not use vague filler like 'consistent effort', 'solid session', or 'maintained good form' unless it is directly tied to a specific number below — if a claim can't be backed by data, cut it.",
    // "- Determine the primary muscle focus from the muscle-group volume ranking below, NOT from the split label alone. The split label is just a name the athlete picked and may not reflect what was actually trained.",
    // "- If personal records were broken, lead with them — name the exercise and the new number. That's the most exciting part of the session.",
    "",
    "Cool-Down: based ONLY on the muscle groups and exercises listed below, recommend 3-5 cool-down stretches as a bulleted list. For each stretch give the name and the hold time (e.g. '30s per side').",
    "",
    "Hard rules: Do NOT add any summary, facts, statistics, research, general fitness advice, motivational quotes, or anything not directly related to this specific workout and its muscles. No medical advice. No exercises or stretches for muscle groups NOT listed below.",
    "",
  ];

  const exerciseLines = exercises
    .map((ex) => {
      const unit = getExerciseUnit(ex);
      const sets = ex.sets.map((s) => `${s.weight || 0}${unit} x ${s.reps || 0}`).join(", ");
      return `- ${ex.name}: ${sets}`;
    })
    .join("\n");

  lines.push(`Split label (as named by athlete): ${splitName || "General"}`);
  if (bodyWeight) lines.push(`Athlete body weight: ${bodyWeight}kg`);
  if (sessionUnit) {
    lines.push(`Total volume this session: ~${Math.round(totalVolume)}${sessionUnit}`);
    if (heaviest) {
      lines.push(`Heaviest set: ${heaviest.exerciseName} — ${heaviest.weight}${sessionUnit} x ${heaviest.reps}`);
    }
  }

  lines.push("");
  lines.push("Exercises performed:");
  lines.push(exerciseLines);

  if (muscleVolumes.length > 0) {
    lines.push("");
    lines.push(
      `Muscle groups trained, ranked by volume (use this — not the split label — to determine primary focus; use ONLY these for cool-down selection): ${muscleVolumes
        .map((m) => `${m.group} (${m.volume}${sessionUnit || "kg"})`)
        .join(", ")}.`,
    );
  }

  if (prsHit.length > 0) {
    lines.push("");
    lines.push(
      `Personal records broken this session: ${prsHit
        .map((p) => `${p.exerciseName} (${p.newPRWeight}kg)`)
        .join(", ")}`,
    );
  }

  return lines.join("\n");
}

export async function generateWorkoutSummary(
  input: WorkoutSummaryInput,
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    console.warn("GROQ_API_KEY is not set. Skipping AI workout summary.");
    return null;
  }
  const model = getGroqModel();
  if (!model) {
    console.warn("GROQ_MODEL is not set. Skipping AI workout summary.");
    return null;
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a data-driven strength and conditioning coach. Your ONLY job is to recommend a cool-down: 3-5 stretches for the muscles actually trained in the session, each with a hold time. Never write a workout summary, never include facts, figures, studies, general advice, or content not about this exact workout.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    console.error(
      "Groq API error:",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = await response.json();
  const summary: string | undefined =
    data?.choices?.[0]?.message?.content?.trim();
  return summary || null;
}

// --- Workout Merge ---

interface MergeWorkoutInput {
  yesterdayTemplate: WorkoutTemplate;
  todayTemplate: WorkoutTemplate;
}

export interface MergedWorkoutResult {
  exercises: {
    name: string;
    targetSets: number;
    targetReps: number;
    unit: string;
    lastWeight: number;
  }[];
  explanation: string;
  estimatedMinutes: number;
}

function resolveExerciseMuscleGroup(name: string): string {
  const allGroups = Object.keys(EXERCISE_LIST) as (keyof typeof EXERCISE_LIST)[];
  for (const group of allGroups) {
    if (EXERCISE_LIST[group].includes(name)) return group;
  }
  return "Other";
}

function buildMergePrompt(input: MergeWorkoutInput): string {
  const { yesterdayTemplate, todayTemplate } = input;

  const todayCount = todayTemplate.exercises.length;
  // Target duration = today's workout only (~10 min per exercise + ~90s rest between sets)
  const targetDuration = todayCount * 10;

  // Build a numbered exercise list with weights
  let idx = 1;

  const formatEx = (ex: Exercise) => {
    const weight = (ex as any).lastWeight || 0;
    const weightStr = weight > 0 ? ` @ ${weight}kg` : "";
    return `  [${idx++}] ${ex.name} — ${ex.targetSets}x${ex.targetReps} ${ex.unit || "reps"}${weightStr}`;
  };

  const yLines = yesterdayTemplate.exercises.map(formatEx);
  const tLines = todayTemplate.exercises.map(formatEx);

  return [
    `Merge yesterday's missed workout with today's planned workout into ONE session.`,
    `Target duration: ~${targetDuration} minutes (same as today's workout alone).`,
    `Each exercise takes ~10 min including 90s rest between sets.`,
    "",
    "EXERCISE LIST (numbered):",
    `YESTERDAY:`,
    yLines.join("\n"),
    `TODAY:`,
    tLines.join("\n"),
    "",
    "OUTPUT FORMAT — one line per exercise you keep:",
    "[number]: [sets]x[reps] @ [weight]kg",
    "...",
    "Then a blank line, then one sentence explaining your decisions.",
    "",
    "RULES:",
    `- You have ~${targetDuration} min. Each exercise ≈ 10 min (90s rest between sets). Pick exercises that fit.`,
    "- To KEEP an exercise: output its number with setsxreps and weight.",
    "- To DROP an exercise: just don't include it.",
    "- Same exercise in both → pick ONE, use higher set count (max +1 set).",
    "- Same muscle, different exercises → keep compound, cut accessory sets by ~25%.",
    "- Drop isolation exercises before compounds if over time.",
    "- You may adjust sets/reps within ±25% of original.",
    "- Weight should match the original's lastWeight (shown as @ Xkg).",
    "",
    "EXAMPLE OUTPUT:",
    "[1]: 4x8 @ 80kg",
    "[3]: 3x10 @ 40kg",
    "[5]: 4x6 @ 100kg",
    "",
    "Kept heavy compounds from both days, dropped one isolation to fit time.",
  ].join("\n");
}

export async function generateMergedWorkout(
  input: MergeWorkoutInput,
): Promise<MergedWorkoutResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    console.warn("GROQ_API_KEY is not set. Skipping AI workout merge.");
    return null;
  }
  const model = getGroqModel();
  if (!model) {
    console.warn("GROQ_MODEL is not set. Skipping AI workout merge.");
    return null;
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            "You are a strength coach merging two workouts into one catch-up session. Exercises are numbered [1], [2], etc. To keep an exercise, output [number]: setsxreps. To drop it, omit it. Then a blank line and one sentence explaining your decisions. Nothing else.",
        },
        { role: "user", content: buildMergePrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    console.error(
      "Groq API error (merge):",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = await response.json();
  const content: string | undefined =
    data?.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  // Strip <think>...</think> tags if the model outputs thinking
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();

  // Parse numbered format: "[1]: 3x10 @ 80kg" → map back to real exercise data
  const lines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);
  const exercises: MergedWorkoutResult["exercises"] = [];
  let explanation = "";

  // Matches "[number]: NxR @ Xkg" or "[number]: NxR" (weight optional)
  const numberedExerciseRegex = /\[(\d+)\]\s*:\s*(\d+)\s*x\s*(\d+)(?:\s*@\s*(\d+(?:\.\d+)?)\s*kg)?/i;

  // Build lookup from the prompt's numbered list
  const exerciseLookup = new Map<number, { name: string; unit: string; weight: number }>();
  let lookupIdx = 1;
  for (const ex of input.yesterdayTemplate.exercises) {
    exerciseLookup.set(lookupIdx++, { name: ex.name, unit: ex.unit || "reps", weight: (ex as any).lastWeight || 0 });
  }
  for (const ex of input.todayTemplate.exercises) {
    exerciseLookup.set(lookupIdx++, { name: ex.name, unit: ex.unit || "reps", weight: (ex as any).lastWeight || 0 });
  }

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("```")) continue;

    const match = line.match(numberedExerciseRegex);
    if (match) {
      const ref = parseInt(match[1], 10);
      const original = exerciseLookup.get(ref);
      if (original) {
        exercises.push({
          name: original.name,
          targetSets: parseInt(match[2], 10),
          targetReps: parseInt(match[3], 10),
          unit: original.unit,
          lastWeight: match[4] ? parseFloat(match[4]) : original.weight,
        });
      }
    } else if (exercises.length > 0) {
      explanation += (explanation ? " " : "") + line;
    }
  }

  if (exercises.length === 0) {
    console.error("No exercises parsed from merge response. Raw:", cleaned);
    return null;
  }

  return {
    exercises,
    explanation: explanation || "Workouts merged successfully.",
    estimatedMinutes: exercises.length * 10,
  };
}