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

export async function getHighestWeightPRsBulk(exerciseIds: string[]): Promise<Record<string, number>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return {};
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    // Using aggregation for better performance on large log sets
    const result = await db.collection("WorkoutLog").aggregate([
      { $match: { userId, "exercises.exerciseId": { $in: exerciseIds } } },
      { $unwind: "$exercises" },
      { $match: { "exercises.exerciseId": { $in: exerciseIds } } },
      { $unwind: "$exercises.sets" },
      { $group: { _id: "$exercises.exerciseId", maxWeight: { $max: "$exercises.sets.weight" } } }
    ]).toArray();

    const prMap: Record<string, number> = {};
    result.forEach(doc => {
      prMap[doc._id] = doc.maxWeight;
    });

    return prMap;
  } catch (error) {
    console.error("Error fetching bulk PRs:", error);
    return {};
  }
}

export async function getRecentPRs(): Promise<{ name: string; weight: number; date: string; increment: number }[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    // Use aggregation to find the maximum weight per exercise and day
    const logs = await db.collection("WorkoutLog").aggregate([
      { $match: { userId } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: {
            name: "$exercises.name",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
          },
          maxWeight: { $max: "$exercises.sets.weight" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]).toArray();

    const prTracker: Record<string, { weight: number; date: string; previousWeight: number }> = {};

    logs.forEach(log => {
      const { name, date } = log._id;
      const weight = log.maxWeight;

      if (!prTracker[name]) {
        prTracker[name] = { weight, date, previousWeight: 0 };
      } else if (weight > prTracker[name].weight) {
        prTracker[name] = { weight, date, previousWeight: prTracker[name].weight };
      }
    });

    const recentPRs = Object.entries(prTracker)
      .map(([name, data]) => ({
        name,
        weight: data.weight,
        date: data.date,
        increment: data.previousWeight > 0 ? Number((data.weight - data.previousWeight).toFixed(2)) : 0
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    return recentPRs;
  } catch (error) {
    console.error("Error fetching recent PRs:", error);
    return [];
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

    const uniqueByDay = new Map<string, WeightTrendData>();
    
    logs.forEach((log) => {
      // Get the local day string. Using ISO string assumes UTC which is fine for trend lines
      const dateStr = (log.date as Date).toISOString().split('T')[0];
      
      // Because logs are sorted by date ascending, overwriting this key 
      // guarantees we keep only the latest/most recent entry for this day!
      uniqueByDay.set(dateStr, {
        id: log._id.toString(),
        date: (log.date as Date).toISOString(),
        bodyWeight: log.bodyWeight as number,
      });
    });

    return Array.from(uniqueByDay.values());
  } catch (error) {
    console.error("Error fetching body weight trend:", error);
    return [];
  }
}

export async function getUserExercises(): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const exercises = await db.collection("WorkoutLog").distinct("exercises.name", { userId });
    return exercises.filter(Boolean).sort();
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    return [];
  }
}

export async function getExerciseProgress(exerciseName: string): Promise<{ date: string; weight: number }[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    const logs = await db.collection("WorkoutLog").aggregate([
      { $match: { userId, "exercises.name": exerciseName } },
      { $unwind: "$exercises" },
      { $match: { "exercises.name": exerciseName } },
      { $project: {
          date: 1,
          maxWeight: { $max: "$exercises.sets.weight" }
      }},
      { $sort: { date: 1 } }
    ]).toArray();

    // Deduplicate by day (keep max weight for the day)
    const dailyMax = new Map<string, number>();
    logs.forEach(log => {
      const dateStr = (log.date as Date).toISOString().split('T')[0];
      const weight = log.maxWeight || 0;
      if (!dailyMax.has(dateStr) || weight > dailyMax.get(dateStr)!) {
        dailyMax.set(dateStr, weight);
      }
    });

    return Array.from(dailyMax.entries()).map(([date, weight]) => ({
      date,
      weight
    }));
  } catch (error) {
    console.error("Error fetching exercise progress:", error);
    return [];
  }
}
