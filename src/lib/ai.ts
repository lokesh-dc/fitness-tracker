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

function resolveMuscleGroups(exercises: Exercise[]): string[] {
  const groups = new Set<string>();
  const allGroups = Object.keys(EXERCISE_LIST) as (keyof typeof EXERCISE_LIST)[];

  for (const ex of exercises) {
    for (const group of allGroups) {
      if (EXERCISE_LIST[group].includes(ex.name)) {
        groups.add(group);
        break;
      }
    }
  }

  return Array.from(groups);
}

function buildPrompt(input: WorkoutSummaryInput): string {
  const { splitName, exercises, durationSeconds, prsHit, bodyWeight } = input;
  const muscleGroups = resolveMuscleGroups(exercises);

  const lines = [
    "You are a professional strength & conditioning coach. Summarize the completed workout below for an athlete.",
    "Part 1 — Summary: concise, motivating, and specific. Use only the data provided. Format as a short paragraph of 3-5 sentences.",
    "Part 2 — Cool-Down: based ONLY on the muscle groups listed below, recommend 3-5 cool-down stretches as a bulleted list. For each stretch give the name and the hold time (e.g. '30s per side').",
    "Hard rules: Do NOT add any facts, statistics, research, general fitness advice, motivational quotes, or anything not directly related to this specific workout and its muscles. No medical advice. No exercises that target muscles NOT listed below.",
  ];

  const exerciseLines = exercises
    .map((ex) => {
      const sets = ex.sets
        .map((s) => `${s.weight || 0}kg x ${s.reps || 0}`)
        .join(", ");
      return `- ${ex.name}: ${sets}`;
    })
    .join("\n");

  lines.push(`Workout split: ${splitName || "General"}`);
  if (bodyWeight) lines.push(`Athlete body weight: ${bodyWeight}kg`);
  if (durationSeconds) {
    const mins = Math.round(durationSeconds / 60);
    lines.push(`Duration: ${mins} minutes`);
  }
  lines.push("Exercises performed:");
  lines.push(exerciseLines);

  if (muscleGroups.length > 0) {
    lines.push(
      `Muscle groups trained (for cool-down selection): ${muscleGroups.join(", ")}. If a muscle group is not listed, do not recommend stretches for it.`,
    );
  }

  if (prsHit.length > 0) {
    lines.push(
      `Personal records broken: ${prsHit
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
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a data-driven strength and conditioning coach. Responses are short, punchy, and strictly grounded in the workout data provided. Never include facts, figures, studies, or advice that is not about this exact workout.",
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
