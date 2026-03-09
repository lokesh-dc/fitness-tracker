import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

const EXERCISE_LIST = {
  "Chest": ["Bench Press (Barbell)", "Incline Bench Press (Barbell)", "Dumbbell Flyes", "Push-ups", "Chest Press (Machine)"],
  "Back": ["Pull-ups", "Lat Pulldown", "Bent Over Row (Barbell)", "Seated Cable Row", "Deadlift", "Single Arm Dumbbell Row"],
  "Shoulders": ["Overhead Press (Barbell)", "Dumbbell Lateral Raise", "Front Raise", "Face Pulls", "Shoulder Press (Machine)"],
  "Legs": ["Squat (Barbell)", "Leg Press", "Leg Extension", "Leg Curl", "Lunges", "Calf Raise"],
  "Arms": ["Bicep Curl (Dumbbell)", "Hammer Curl", "Tricep Pushdown", "Skullcrushers", "Preacher Curl"],
  "Core": ["Plank", "Crunches", "Leg Raise", "Russian Twist"],
  "Cardio": ["Running", "Cycling", "Swimming", "Jump Rope"]
};

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db()
    console.log("Seeding Exercises...");
    await db.collection("Exercises").deleteMany({}); // Start fresh
    const dbExercises = [];
    for (const [muscleGroup, exerciseNames] of Object.entries(EXERCISE_LIST)) {
      for (const name of exerciseNames) {
        dbExercises.push({
          name,
          muscleGroup,
          unit: "reps", // Default unit
          isCustom: false,
          createdAt: new Date(),
        });
      }
    }
    await db.collection("Exercises").insertMany(dbExercises);

    console.log("Seed successful!");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await client.close();
  }
}

seed();
