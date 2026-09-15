import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

// Same map as scripts/seed.ts — kept in sync so existing databases get the
// "OR" alternatives without a destructive reseed (custom exercises preserved).
const ALTERNATIVES: Record<string, string[]> = {
  "Bench Press (Barbell)": ["Incline Bench Press (Barbell)", "Chest Press (Machine)", "Dumbbell Flyes", "Push-ups"],
  "Incline Bench Press (Barbell)": ["Bench Press (Barbell)", "Chest Press (Machine)", "Push-ups"],
  "Chest Press (Machine)": ["Bench Press (Barbell)", "Incline Bench Press (Barbell)", "Push-ups"],
  "Dumbbell Flyes": ["Chest Press (Machine)", "Push-ups"],
  "Push-ups": ["Chest Press (Machine)", "Bench Press (Barbell)"],
  "Pull-ups": ["Lat Pulldown", "Seated Cable Row"],
  "Lat Pulldown": ["Pull-ups", "Bent Over Row (Barbell)", "Seated Cable Row"],
  "Bent Over Row (Barbell)": ["Seated Cable Row", "Single Arm Dumbbell Row", "Lat Pulldown"],
  "Seated Cable Row": ["Bent Over Row (Barbell)", "Single Arm Dumbbell Row"],
  "Single Arm Dumbbell Row": ["Seated Cable Row", "Bent Over Row (Barbell)"],
  "Overhead Press (Barbell)": ["Shoulder Press (Machine)", "Dumbbell Lateral Raise", "Front Raise"],
  "Shoulder Press (Machine)": ["Overhead Press (Barbell)", "Dumbbell Lateral Raise"],
  "Dumbbell Lateral Raise": ["Front Raise", "Shoulder Press (Machine)"],
  "Squat (Barbell)": ["Leg Press", "Lunges", "Leg Extension"],
  "Leg Press": ["Squat (Barbell)", "Lunges", "Leg Extension"],
  "Leg Extension": ["Leg Curl", "Lunges"],
  "Leg Curl": ["Leg Extension", "Lunges"],
  "Lunges": ["Leg Press", "Squat (Barbell)"],
  "Calf Raise": ["Leg Press"],
  "Bicep Curl (Dumbbell)": ["Hammer Curl", "Preacher Curl"],
  "Hammer Curl": ["Bicep Curl (Dumbbell)", "Preacher Curl"],
  "Preacher Curl": ["Bicep Curl (Dumbbell)", "Hammer Curl"],
  "Tricep Pushdown": ["Skullcrushers"],
  "Skullcrushers": ["Tricep Pushdown"],
  "Crunches": ["Leg Raise", "Russian Twist"],
  "Leg Raise": ["Crunches", "Russian Twist"],
  "Russian Twist": ["Crunches", "Leg Raise"],
};

async function seedAlternatives() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log("Backfilling exercise alternatives...");

    let updated = 0;
    for (const [name, alternatives] of Object.entries(ALTERNATIVES)) {
      const res = await db
        .collection("Exercises")
        .updateOne({ name }, { $set: { alternatives } });
      if (res.matchedCount > 0) updated++;
      else console.log(`  Skipped (not found): ${name}`);
    }

    console.log(`Updated ${updated} exercises with alternatives.`);
    console.log("Seed alternatives successful!");
  } catch (err) {
    console.error("Seed alternatives failed:", err);
  } finally {
    await client.close();
  }
}

seedAlternatives();