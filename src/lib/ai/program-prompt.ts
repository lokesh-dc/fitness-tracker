import { Goal, ExperienceLevel, Equipment, SplitStyle } from "@/types/workout";

const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Legs", "Biceps", "Triceps", "Forearms", "Core", "Cardio",
] as const;

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

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

const SPLIT_INSTRUCTIONS: Record<SplitStyle, string> = {
  "full-body":
    "Every scheduled training day is a FULL BODY session covering a push, a pull, and a legs movement. Label each day \"Full Body\" but vary the exercise emphasis slightly between sessions.",
  "upper-lower":
    "Alternate UPPER and LOWER days. Upper days target Chest, Back, Shoulders, Biceps, Triceps; lower days target Legs (quads, hamstrings, glutes, calves) plus Core. Label each [DAY] \"Upper\" or \"Lower\" in alternating order.",
  "ppl":
    "Use the classic PUSH / PULL / LEGS rotation in that exact order. Push = Chest + Shoulders + Triceps, Pull = Back + Biceps + Forearms, Legs = quads/hamstrings/glutes/calves + Core. With 6 days repeat the rotation twice (Push, Pull, Legs, Push, Pull, Legs). Name each [DAY] accordingly.",
  "ppl-upper-lower":
    "Use the 5-day hybrid split in this exact order: Upper, Lower, Pull, Push, Legs. Upper = Chest + Back + Shoulders + Arms; Lower = Legs + Core; Pull = Back + Biceps + Forearms; Push = Chest + Shoulders + Triceps; Legs = quads/hamstrings/glutes/calves.",
  "bro":
    "Use one muscle group per day in this order across the scheduled days: Chest, Back, Shoulders, Arms (Biceps + Triceps), Legs, and Core/conditioning if a sixth day is scheduled. Name each [DAY] after its muscle group.",
};

export function buildProgramPrompt(input: {
  goal: Goal;
  daysPerWeek: number;
  trainingDays: number[];
  splitStyle: SplitStyle;
  equipment: Equipment[];
  experienceLevel: ExperienceLevel;
  weeksCount: number;
  dayAssignments?: Record<number, string>;
}): string {
  const { goal, daysPerWeek, trainingDays, splitStyle, equipment, experienceLevel, weeksCount, dayAssignments } = input;

  const dayList = trainingDays
    .map((d) => `${DAY_NAMES[d]} (${d})`)
    .join(", ");
  const dayNumbers = trainingDays.join(", ");
  const exampleDayA = trainingDays[0] ?? 1;
  const exampleDayB = trainingDays[1] ?? 3;

  // Build explicit day-to-split assignment block if the user provided preferences
  const dayAssignmentLines = dayAssignments && Object.keys(dayAssignments).length > 0
    ? [
        "",
        "Day-to-split assignments chosen by the athlete (MUST follow exactly — do not deviate):",
        ...trainingDays
          .filter((d) => dayAssignments[d])
          .map((d) => `  ${DAY_NAMES[d]} (${d}) → ${dayAssignments[d]}`),
        "Each [DAY] split name MUST match exactly what is listed above for that dayOfWeek.",
      ]
    : [];

  return [
    `Design a ${weeksCount}-week training program for ${daysPerWeek} days per week.`,
    "",
    `The athlete's scheduled training days: ${dayList}.`,
    `Output EXACTLY ${daysPerWeek} [DAY] blocks — one for each of these dayOfWeek values: ${dayNumbers}. Never invent other days.`,
    "",
    `Goal: ${goal}. ${GOAL_INSTRUCTIONS[goal]}`,
    `Experience: ${experienceLevel}. ${EXPERIENCE_INSTRUCTIONS[experienceLevel]}`,
    `Available equipment: ${equipment.join(", ")}. Only use exercises that can be performed with this equipment.`,
    "",
    `Split: ${SPLIT_INSTRUCTIONS[splitStyle]}`,
    ...dayAssignmentLines,
    "",
    "Each training day must fill a full ~60-minute workout:",
    "- Include 5-7 exercises per day (never fewer than 5) with 3-4 working sets each — roughly 20-28 total sets per session.",
    "- Rest 60-90 seconds between sets (more for heavy compound lifts). Ensure total volume, sets, and resting time reach roughly 45-75 minutes.",
    `Valid muscle group tags (use EXACTLY these, case-sensitive): ${MUSCLE_GROUPS.join(", ")}`,
    "",
    "RESPONSE FORMAT — respond in plain text, NOT JSON:",
    "- Output ONLY lines starting with a tag: [DAY], [RATIONALE], or [EXERCISE]. One tag per line. No bullets, no numbering, no markdown, no JSON, no preamble, no closing remarks.",
    `- Exactly ${daysPerWeek} [DAY] lines, one for each scheduled weekday above (${dayNumbers}).`,
    "- [DAY] <dayOfWeek> | <Split Name>  — dayOfWeek is the scheduled number (0=Sunday, 1=Monday, ... 6=Saturday); Split Name must match the selected split (e.g. \"Push\", \"Pull\", \"Legs\", \"Upper\", \"Lower\", \"Full Body\", or a muscle group).",
    "- [RATIONALE] <1-2 sentences>  — why this day's split and exercises fit the goal, frequency, and experience level.",
    "- [EXERCISE] <Exercise Name> | <Muscle Group> | <Sets> | <Reps> | <Rest Seconds>  — one exercise per line.",
    "- Include 5-7 [EXERCISE] lines per day so every session lasts about an hour. Never fewer than 5.",
    "- Use EXACTLY one valid Muscle Group tag per exercise. Rest seconds default to 90.",
    "- In the FIRST week, every exercise the athlete may already be lifting gets 3 working sets at its known starting weight; keep the split's muscle-group coverage balanced across the week.",
    "- Do NOT repeat the same exercise on multiple days in the same week.",
    "- Ensure every relevant muscle group is trained an appropriate number of times per week for the goal.",
    "",
    "EXAMPLE (shape only — not the actual program):",
    "",
    `[DAY] ${exampleDayA} | Push`,
    "[RATIONALE] Chest, shoulders, and triceps grouped together for recovery spacing across the week.",
    "[EXERCISE] Bench Press (Barbell) | Chest | 4 | 6 | 120",
    "[EXERCISE] Overhead Press (Barbell) | Shoulders | 3 | 8 | 90",
    "",
    `[DAY] ${exampleDayB} | Pull`,
    "[RATIONALE] Back and biceps paired so pulling volume doesn't fight pressing recovery.",
    "[EXERCISE] Deadlift (Barbell) | Back | 3 | 5 | 150",
  ].join("\n");
}
