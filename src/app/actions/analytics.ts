"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { Exercise, WeightTrendData } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getHighestWeightPR(exerciseName: string): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 0;
    const userId = (session.user as any).id;

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

export async function getBodyWeightTrend(): Promise<WeightTrendData[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = (session.user as any).id;

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
