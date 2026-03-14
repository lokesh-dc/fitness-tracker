"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { WorkoutLog, Exercise } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function saveWorkoutSession(
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
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = (session.user as any).id;

    const db = await getDb();
    
    // Check if there is an empty log from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emptyLog = await db.collection("WorkoutLog").findOne(
      {
        userId: new ObjectId(userId),
        date: { $gte: today },
        $or: [
          { exercises: { $size: 0 } },
          { exercises: { $exists: false } }
        ]
      },
      { sort: { date: -1 } }
    );

    let log: any;
    
    if (emptyLog) {
      await db.collection("WorkoutLog").updateOne(
        { _id: emptyLog._id },
        { 
          $set: { 
            bodyWeight: data.bodyWeight, 
            exercises: data.exercises 
          } 
        }
      );
      log = { ...emptyLog, bodyWeight: data.bodyWeight, exercises: data.exercises, id: emptyLog._id.toString() };
    } else {
      const logData = {
        userId: new ObjectId(userId),
        date: new Date(),
        bodyWeight: data.bodyWeight,
        exercises: data.exercises,
        createdAt: new Date(),
      };
      const result = await db.collection("WorkoutLog").insertOne(logData);
      log = { ...logData, id: result.insertedId.toString() };
    }

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
            return { ...ex, lastWeight: maxSessionWeight };
          }
          return ex;
        });

        await db.collection("WorkoutTemplate").updateOne(
          { _id: template._id },
          { $set: { exercises: updatedExercises, updatedAt: new Date() } }
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

export async function getTodayBodyWeight(): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    // Get beginning of current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: today },
        bodyWeight: { $exists: true, $ne: null }
      },
      { sort: { date: -1 } }
    );

    return log?.bodyWeight || null;
  } catch (error) {
    console.error("Error getting today's body weight:", error);
    return null;
  }
}

export async function saveBodyWeight(bodyWeight: number): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    
    // Get beginning of current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // See if there's an existing log for today with bodyWeight
    const existingLog = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: today }
      },
      { sort: { date: -1 } }
    );

    if (existingLog) {
      await db.collection("WorkoutLog").updateOne(
        { _id: existingLog._id },
        { $set: { bodyWeight } }
      );
    } else {
      await db.collection("WorkoutLog").insertOne({
        userId,
        date: new Date(),
        bodyWeight,
        exercises: [],
        createdAt: new Date(),
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error saving body weight:", error);
    throw new Error("Failed to save body weight.");
  }
}

export async function saveSingleExerciseLog(
  exercise: Exercise,
  updateTemplate: boolean
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's log
    const existingLog = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: today }
      },
      { sort: { date: -1 } }
    );

    if (!existingLog) {
      // Should ideally not happen if they come from Step 1, but let's be safe
      await db.collection("WorkoutLog").insertOne({
        userId,
        date: new Date(),
        exercises: [exercise],
        createdAt: new Date(),
      });
    } else {
      // Update existing log
      const exercises = existingLog.exercises || [];
      const index = exercises.findIndex((ex: any) => ex.exerciseId === exercise.exerciseId);
      
      if (index > -1) {
        exercises[index] = exercise;
      } else {
        exercises.push(exercise);
      }

      await db.collection("WorkoutLog").updateOne(
        { _id: existingLog._id },
        { $set: { exercises, updatedAt: new Date() } }
      );
    }

    if (updateTemplate) {
      const dayOfWeek = getCurrentDayOfWeek();
      const weekNumber = getCurrentWeekIndex();

      const template = await db.collection("WorkoutTemplate").findOne({
        userId,
        weekNumber,
        dayOfWeek,
      });

      if (template) {
        const updatedExercises = (template.exercises as Exercise[]).map((ex) => {
          if (ex.exerciseId === exercise.exerciseId && exercise.sets.length > 0) {
            const maxSessionWeight = Math.max(...exercise.sets.map((s) => s.weight));
            return { ...ex, lastWeight: maxSessionWeight };
          }
          return ex;
        });

        await db.collection("WorkoutTemplate").updateOne(
          { _id: template._id },
          { $set: { exercises: updatedExercises, updatedAt: new Date() } }
        );
      }
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error saving single exercise log:", error);
    throw new Error("Failed to save exercise.");
  }
}
export async function getTodayWorkoutLog(): Promise<WorkoutLog | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: today }
      },
      { sort: { date: -1 } }
    );

    if (!log) return null;
    return JSON.parse(JSON.stringify(log)) as WorkoutLog;
  } catch (error) {
    console.error("Error getting today's workout log:", error);
    return null;
  }
}

export async function getWorkoutHistory(): Promise<WorkoutLog[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    const logsRaw = await db.collection("WorkoutLog")
      .find({ userId })
      .sort({ date: -1 })
      .toArray();

    // Aggregate by local date strings to ensure 1 unique card per day
    const aggregatedLogs = logsRaw.reduce((acc, log) => {
      // Use the local date string portion (e.g., "2024-03-14")
      const dateStr = new Date(log.date).toDateString();
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          id: log._id.toString(), // Use the first found ID as the primary route parameter
          userId: log.userId.toString(),
          date: log.date,
          bodyWeight: log.bodyWeight || null,
          exercises: [...(log.exercises || [])],
          createdAt: log.createdAt,
        };
      } else {
        // Merge this log into the existing date
        const existing = acc[dateStr];
        existing.exercises = [...existing.exercises, ...(log.exercises || [])];
        if (!existing.bodyWeight && log.bodyWeight) {
          existing.bodyWeight = log.bodyWeight;
        }
      }
      return acc;
    }, {} as Record<string, WorkoutLog>);

    // Convert back to array
    return Object.values(aggregatedLogs) as WorkoutLog[];
  } catch (error) {
    console.error("Error getting workout history:", error);
    return [];
  }
}

export async function getWorkoutByDate(dateStr: string): Promise<WorkoutLog | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Parse the incoming YYYY-MM-DD string into a local startOfDay and endOfDay
    // We append T00:00:00 to ensure date-fns/native Date parser treats it as local time, not UTC
    const targetDate = new Date(`${dateStr}T00:00:00`);
    if (isNaN(targetDate.getTime())) return null;

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find the most recent log for the target date
    const targetLog = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      { sort: { createdAt: -1 } }
    );

    if (!targetLog) return null;

    return {
      id: targetLog._id.toString(),
      userId: targetLog.userId.toString(),
      date: targetLog.date,
      bodyWeight: targetLog.bodyWeight || null,
      exercises: targetLog.exercises || [],
      createdAt: targetLog.createdAt
    } as unknown as WorkoutLog;

  } catch (error) {
    console.error("Error getting workout by date:", error);
    return null;
  }
}
