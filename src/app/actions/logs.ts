"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { WorkoutLog, Exercise } from "@/types/workout";

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
    
    const logData = {
      userId: new ObjectId(userId),
      date: new Date(),
      bodyWeight: data.bodyWeight,
      exercises: data.exercises,
      createdAt: new Date(),
    };

    const result = await db.collection("WorkoutLog").insertOne(logData);
    const log = { ...logData, id: result.insertedId.toString() };

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
