import { Goal, ExperienceLevel, Equipment } from "@/types/workout";

const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Legs", "Biceps", "Triceps", "Forearms", "Core", "Cardio",
] as const;

const GOAL_INSTRUCTIONS: Record<Goal, string> = {
  strength:
    "Prioritize compound lifts with heavy loads and low-to-moderate rep ranges (3-6 reps). Focus on progressive overload. Accessory work should support the main lifts, not fatigue them.",
  hypertrophy:
    "Prioritize volume and time under tension. Use moderate loads with moderate rep ranges (8-12 reps). Include isolation work for lagging groups. Aim for 10-20 sets per muscle group per week.",
  endurance:
    "Prioritize higher rep ranges (12-20+), shorter rest periods, and metabolic stress. Include circuit-style pairings and conditioning elements where appropriate.",
};

const EXPERIENCE_INSTRUCTIONS: Record<ExperienceLevel, string> = {
  beginner:
    "Keep exercises simple and teach foundational movement patterns. 2-3 sets per exercise is sufficient. Avoid overly complex supersets or advanced techniques.",
  intermediate:
    "Use a mix of compound and isolation work. 3-4 sets per exercise. Can handle moderate complexity like supersets or drop sets.",
  advanced:
    "Can handle higher volume, advanced techniques (rest-pause, mechanical drop sets, myoreps), and more exercise variety. 3-5 sets per exercise.",
};

export function buildProgramPrompt(input: {
  goal: Goal;
  daysPerWeek: number;
  equipment: Equipment[];
  experienceLevel: ExperienceLevel;
  weeksCount: number;
}): string {
  const { goal, daysPerWeek, equipment, experienceLevel, weeksCount } = input;

  return [
    `Design a ${weeksCount}-week training program for ${daysPerWeek} days per week.`,
    "",
    `Goal: ${goal}. ${GOAL_INSTRUCTIONS[goal]}`,
    `Experience: ${experienceLevel}. ${EXPERIENCE_INSTRUCTIONS[experienceLevel]}`,
    `Available equipment: ${equipment.join(", ")}. Only use exercises that can be performed with this equipment.`,
    "",
    `Valid muscle group tags (use EXACTLY these, case-sensitive): ${MUSCLE_GROUPS.join(", ")}`,
    "",
    "RESPONSE FORMAT — respond in plain text, NOT JSON:",
    "- Output ONLY lines starting with a tag: [DAY], [RATIONALE], or [EXERCISE]. One tag per line. No bullets, no numbering, no markdown, no JSON, no preamble, no closing remarks.",
    `- Exactly ${daysPerWeek} [DAY] lines — one per training day in this schedule.`,
    "- [DAY] <dayOfWeek> | <Split Name>  — dayOfWeek is a number (0=Sunday, 1=Monday, ... 6=Saturday); Split Name is a short label like \"Push\" or \"Legs\".",
    "- [RATIONALE] <1-2 sentences>  — why this day's split and exercises fit the goal, frequency, and experience level.",
    "- [EXERCISE] <Exercise Name> | <Muscle Group> | <Sets> | <Reps> | <Rest Seconds>  — one exercise per line.",
    "- Include 3-8 [EXERCISE] lines per day depending on the split.",
    "- Use EXACTLY one valid Muscle Group tag per exercise. Rest seconds default to 90.",
    "- Do NOT repeat the same exercise on multiple days in the same week.",
    "- Ensure every relevant muscle group is trained an appropriate number of times per week for the goal.",
    "",
    "EXAMPLE (shape only — not the actual program):",
    "",
    "[DAY] 1 | Push",
    "[RATIONALE] Chest, shoulders, and triceps grouped together for recovery spacing across the week.",
    "[EXERCISE] Bench Press (Barbell) | Chest | 4 | 6 | 120",
    "[EXERCISE] Overhead Press (Barbell) | Shoulders | 3 | 8 | 90",
    "",
    "[DAY] 3 | Pull",
    "[RATIONALE] Back and biceps paired so pulling volume doesn't fight pressing recovery.",
    "[EXERCISE] Deadlift (Barbell) | Back | 3 | 5 | 150",
  ].join("\n");
}
