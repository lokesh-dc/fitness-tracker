"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { Exercise, WeightTrendData } from "@/types/workout";

export async function getHighestWeightPR(userId: string, exerciseName: string): Promise<number> {
  try {
    const db = await getDb();
    const logs = await db.collection("WorkoutLog").find({
      userId: new ObjectId(userId),
      "exercises.name": exerciseName,
    }).toArray();

    let highestWeight = 0;

    logs.forEach((log) => {
      const exercise = (log.exercises as Exercise[]).find((ex) => ex.name === exerciseName);
      if (exercise) {
        exercise.sets.forEach((set) => {
          if (set.weight > highestWeight) {
            highestWeight = set.weight;
          }
        });
      }
    });

    return highestWeight;
  } catch (error) {
    console.error("Error fetching highest weight PR:", error);
    return 0;
  }
}

export async function getBodyWeightTrend(userId: string): Promise<WeightTrendData[]> {
  try {
    const db = await getDb();
    const logs = await db.collection("WorkoutLog").find({
      userId: new ObjectId(userId),
      bodyWeight: { $ne: null }
    })
    .sort({ date: 1 })
    .project({
      date: 1,
      bodyWeight: 1,
    })
    .toArray();

    return logs.map(log => ({
      id: log._id.toString(),
      date: (log.date as Date).toISOString(),
      bodyWeight: log.bodyWeight as number,
    }));
  } catch (error) {
    console.error("Error fetching body weight trend:", error);
    return [];
  }
}
