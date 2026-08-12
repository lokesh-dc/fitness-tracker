import { Exercise, PRHit } from "@/types/workout";
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