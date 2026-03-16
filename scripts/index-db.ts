import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";
loadEnvConfig(process.cwd());

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

async function ensureIndexes() {
  console.log("🚀 Starting database indexing...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // 1. WorkoutLog Indexes
    console.log("📦 Indexing WorkoutLog...");
    await db.collection("WorkoutLog").createIndex({ userId: 1, date: -1 });
    await db.collection("WorkoutLog").createIndex({ "exercises.name": 1 });
    await db.collection("WorkoutLog").createIndex({ "exercises.exerciseId": 1 });

    // 2. WorkoutTemplate Indexes
    console.log("📋 Indexing WorkoutTemplate...");
    await db.collection("WorkoutTemplate").createIndex({ userId: 1, planId: 1, dayOfWeek: 1 });
    await db.collection("WorkoutTemplate").createIndex({ userId: 1, weekNumber: 1, dayOfWeek: 1 });

    // 3. PlanDocument Indexes
    console.log("📄 Indexing PlanDocument...");
    await db.collection("PlanDocument").createIndex({ userId: 1, startDate: -1 });

    // 4. Exercises Indexes
    console.log("🏋️ Indexing Exercises...");
    await db.collection("Exercises").createIndex({ name: 1 });
    await db.collection("Exercises").createIndex({ muscleGroup: 1 });

    console.log("✅ Database indexing completed successfully!");
  } catch (err) {
    console.error("❌ Indexing failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

ensureIndexes();
