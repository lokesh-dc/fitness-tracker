"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { WeightTrendData, SetLog } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getHighestWeightPR(exerciseName: string): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 0;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    // Using aggregation for better performance on large log sets
    const result = await db.collection("WorkoutLog").aggregate([
      { $match: { userId, "exercises.name": exerciseName } },
      { $unwind: "$exercises" },
      { $match: { "exercises.name": exerciseName } },
      { $unwind: "$exercises.sets" },
      { $group: { _id: null, maxWeight: { $max: "$exercises.sets.weight" } } }
    ]).toArray();

    return result[0]?.maxWeight || 0;
  } catch (error) {
    console.error("Error fetching highest weight PR:", error);
    return 0;
  }
}

export async function getExerciseHistory(exerciseName: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Get the most recent log containing this exercise to suggest sets/reps
    const lastLog = await db.collection("WorkoutLog")
      .find({ userId, "exercises.name": exerciseName })
      .sort({ date: -1 })
      .limit(1)
      .toArray();

    const pr = await getHighestWeightPR(exerciseName);

    let suggestedSets = 3;
    let suggestedReps = 10;
    let lastWeight = 0;

    if (lastLog.length > 0) {
      const exercise = lastLog[0].exercises.find((ex: any) => ex.name === exerciseName);
      if (exercise) {
        suggestedSets = exercise.sets.length;
        suggestedReps = exercise.sets[0]?.reps || 10;
        lastWeight = Math.max(...exercise.sets.map((s: SetLog) => s.weight));
      }
    }

    return {
      pr,
      suggestedSets,
      suggestedReps,
      lastWeight
    };
  } catch (error) {
    console.error("Error fetching exercise history:", error);
    return null;
  }
}

export async function getBodyWeightTrend(): Promise<WeightTrendData[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const logs = await db.collection("WorkoutLog").find({
      userId,
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
