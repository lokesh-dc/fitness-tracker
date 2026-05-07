import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

const IMAGE_MAPPING: Record<string, string> = {
  "Bench Press (Barbell)": "/assets/exercises/bench-press.png",
  "Squat (Barbell)": "/assets/exercises/squat.png",
  "Deadlift": "/assets/exercises/deadlift.png",
  "Pull-ups": "/assets/exercises/pull-ups.png",
  "Overhead Press (Barbell)": "/assets/exercises/overhead-press.png",
  "Bicep Curl (Dumbbell)": "/assets/exercises/bicep-curl.png",
  "Plank": "/assets/exercises/plank.png",
  "Running": "/assets/exercises/running.png",
};

async function updateImages() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log("Updating Exercise Images...");

    for (const [name, image] of Object.entries(IMAGE_MAPPING)) {
      const result = await db.collection("Exercises").updateOne(
        { name },
        { $set: { image } }
      );
      console.log(`Updated ${name}: ${result.modifiedCount} matches`);
    }

    console.log("Update successful!");
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await client.close();
  }
}

updateImages();
