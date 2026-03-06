"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId, Document } from "mongodb";
import { revalidatePath } from "next/cache";

export interface SetLog {
  weight: number;
  reps: number;
}

export interface Exercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  lastWeight?: number;
  sets: SetLog[];
  pr?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  weekNumber: number;
  dayOfWeek: number;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string | Date;
  bodyWeight?: number;
  exercises: Exercise[];
  createdAt: string | Date;
}

// Helper to get current day of week (0-6)
const getCurrentDayOfWeek = () => new Date().getDay();

// Simple mock for "Current Week" in a 12-week cycle
const getCurrentWeekIndex = () => {
  return 1; // Mocking week 1 for now
};

async function getDb() {
  const client = await clientPromise;
  return client.db();
}

export async function getTodayPlan(userId: string): Promise<WorkoutTemplate | null> {
  try {
    const db = await getDb();
    const dayOfWeek = getCurrentDayOfWeek();
    const weekNumber = getCurrentWeekIndex();

    const plan = await db.collection("WorkoutTemplate").findOne({
      userId: new ObjectId(userId),
      weekNumber,
      dayOfWeek,
    }) as (WithId<Document> & Partial<WorkoutTemplate>) | null;

    if (!plan) return null;

    const { _id, ...rest } = plan;

    // Map _id to id and convert ObjectIds to strings for client-side compatibility
    const formattedPlan = {
      ...rest,
      id: _id.toString(),
      userId: plan.userId ? plan.userId.toString() : "",
    };

    return JSON.parse(JSON.stringify(formattedPlan)) as WorkoutTemplate;
  } catch (error) {
    console.error("Error fetching today's plan:", error);
    return null;
  }
}

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

export async function saveWorkoutSession(
  userId: string,
  data: {
    bodyWeight?: number;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  },
  updateTemplate: boolean
): Promise<WorkoutLog> {
  try {
    const db = await getDb();
    
    // 1. Save to logs
    const logData = {
      userId: new ObjectId(userId),
      date: new Date(),
      bodyWeight: data.bodyWeight,
      exercises: data.exercises,
      createdAt: new Date(),
    };

    const result = await db.collection("WorkoutLog").insertOne(logData);
    const log = { ...logData, id: result.insertedId.toString() };

    // 2. If updateTemplate is true, update the master template for the current day
    if (updateTemplate) {
      const dayOfWeek = getCurrentDayOfWeek();
      const weekNumber = getCurrentWeekIndex();

      const template = await db.collection("WorkoutTemplate").findOne({
        userId: new ObjectId(userId),
        weekNumber,
        dayOfWeek,
      });

      if (template) {
        const updatedExercises = (template.exercises as Exercise[]).map((ex) => {
          const sessionEx = data.exercises.find((se) => se.name === ex.name);
          if (sessionEx && sessionEx.sets.length > 0) {
            const maxSessionWeight = Math.max(...sessionEx.sets.map((s) => s.weight));
            return {
              ...ex,
              lastWeight: maxSessionWeight,
            };
          }
          return ex;
        });

        await db.collection("WorkoutTemplate").updateOne(
          { _id: template._id },
          {
            $set: {
              exercises: updatedExercises,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    revalidatePath("/");
    return JSON.parse(JSON.stringify(log)) as WorkoutLog;
  } catch (error) {
    console.error("Error saving workout session:", error);
    throw new Error("Failed to save workout session.");
  }
}

export async function getBodyWeightTrend(userId: string) {
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
      ...log,
      id: log._id.toString(),
      date: log.date.toISOString(), // Ensure date is serializable
    }));
  } catch (error) {
    console.error("Error fetching body weight trend:", error);
    return [];
  }
}
