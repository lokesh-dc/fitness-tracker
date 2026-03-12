import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";
const userId = "69b288294677281155bb5dad";

async function seedWeight() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    console.log("Seeding Mock Weight Data for last 30 days...");
    
    // Clear existing logs for this user to avoid mess, or just append
    // await db.collection("WorkoutLog").deleteMany({ userId: new ObjectId(userId) });

    const logs = [];
    const now = new Date();
    let currentWeight = 85.5; // Starting weight

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Add some random fluctuation
      currentWeight += (Math.random() - 0.5) * 0.4;
      
      logs.push({
        userId: new ObjectId(userId),
        date: date,
        bodyWeight: parseFloat(currentWeight.toFixed(1)),
        exercises: [], // Mock empty exercises for these weight-only logs
        createdAt: new Date(),
      });
    }

    await db.collection("WorkoutLog").insertMany(logs);
    console.log("Mock weight data seeded successfully!");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await client.close();
  }
}

seedWeight();
