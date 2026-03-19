"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { WorkoutLog, Exercise, SetLog } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// export async function saveWorkoutSession(
//   data: {
//     bodyWeight?: number;
//     name?: string;
//     splitName?: string;
//     exercises: Array<{
//       exerciseId: string;
//       name: string;
//       sets: Array<{ weight: number; reps: number }>;
//     }>;
//   },
//   updateTemplate: boolean,
//   date?: string | Date
// ): Promise<WorkoutLog> {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) throw new Error("Unauthorized");
//     const userId = (session.user as any).id;

//     const db = await getDb();

//     // Target date normalized to start/end of that day
//     const targetDate = date ? new Date(date) : new Date();
//     const startOfDay = new Date(targetDate);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(targetDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     const existingLog = await db.collection("WorkoutLog").findOne(
//       {
//         userId: new ObjectId(userId),
//         date: { $gte: startOfDay, $lte: endOfDay }
//       },
//       { sort: { date: -1 } }
//     );

//     let log: any;

//     if (existingLog) {
//       const mergedExercises = [...(existingLog.exercises || [])];

//       for (const newEx of data.exercises) {
//         const index = mergedExercises.findIndex((ex: any) => ex.exerciseId === newEx.exerciseId);
//         if (index > -1) {
//           mergedExercises[index] = newEx;
//         } else {
//           mergedExercises.push(newEx);
//         }
//       }

//       await db.collection("WorkoutLog").updateOne(
//         { _id: existingLog._id },
//         { 
//           $set: { 
//             bodyWeight: data.bodyWeight !== undefined ? data.bodyWeight : existingLog.bodyWeight, 
//             exercises: mergedExercises,
//             updatedAt: new Date()
//           } 
//         }
//       );
//       log = { 
//         ...existingLog, 
//         bodyWeight: data.bodyWeight !== undefined ? data.bodyWeight : existingLog.bodyWeight, 
//         name: data.name !== undefined ? data.name : existingLog.name,
//         splitName: data.splitName !== undefined ? data.splitName : existingLog.splitName,
//         exercises: mergedExercises, 
//         id: existingLog._id.toString() 
//       };
//     } else {
//       const logData = {
//         userId: new ObjectId(userId),
//         date: startOfDay,
//         bodyWeight: data.bodyWeight,
//         name: data.name,
//         splitName: data.splitName,
//         exercises: data.exercises,
//         createdAt: new Date(),
//       };
//       const result = await db.collection("WorkoutLog").insertOne(logData);
//       log = { ...logData, id: result.insertedId.toString() };
//     }

//     if (updateTemplate) {
//       const dayOfWeek = getCurrentDayOfWeek();
//       const weekNumber = getCurrentWeekIndex();

//       const template = await db.collection("WorkoutTemplate").findOne({
//         userId: new ObjectId(userId),
//         weekNumber,
//         dayOfWeek,
//       });

//       if (template) {
//         const updatedExercises = (template.exercises as Exercise[]).map((ex) => {
//           const sessionEx = data.exercises.find((se) => se.name === ex.name);
//           if (sessionEx && sessionEx.sets.length > 0) {
//             const maxSessionWeight = Math.max(...sessionEx.sets.map((s) => s.weight));
//             return { ...ex, lastWeight: maxSessionWeight };
//           }
//           return ex;
//         });

//         await db.collection("WorkoutTemplate").updateOne(
//           { _id: template._id },
//           { $set: { exercises: updatedExercises, updatedAt: new Date() } }
//         );
//       }
//     }

//     revalidatePath("/");
//     return JSON.parse(JSON.stringify(log)) as WorkoutLog;
//   } catch (error) {
//     console.error("Error saving workout session:", error);
//     throw new Error("Failed to save workout session.");
//   }
// }

export async function saveWorkoutSession(
  data: {
    bodyWeight?: number;
    name?: string;
    splitName?: string;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  },
  updateTemplate: boolean,
  date?: string | Date
): Promise<WorkoutLog> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = (session.user as any).id;

    const db = await getDb();

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await db.collection("WorkoutLog").findOne(
      {
        userId: new ObjectId(userId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { sort: { date: -1 } }
    );

    let log: any;

    if (existingLog) {
      const mergedExercises = [...(existingLog.exercises || [])];

      for (const newEx of data.exercises) {
        const index = mergedExercises.findIndex(
          (ex: any) => ex.exerciseId === newEx.exerciseId
        );
        if (index > -1) {
          mergedExercises[index] = newEx;
        } else {
          mergedExercises.push(newEx);
        }
      }

      const updatedAt = new Date();

      // FIX 1: persist name & splitName to the database on update
      await db.collection("WorkoutLog").updateOne(
        { _id: existingLog._id },
        {
          $set: {
            bodyWeight:
              data.bodyWeight !== undefined
                ? data.bodyWeight
                : existingLog.bodyWeight,
            name: data.name !== undefined ? data.name : existingLog.name,
            splitName:
              data.splitName !== undefined
                ? data.splitName
                : existingLog.splitName,
            exercises: mergedExercises,
            updatedAt,
          },
        }
      );

      // FIX 3: reflect updatedAt in the returned object
      log = {
        ...existingLog,
        bodyWeight:
          data.bodyWeight !== undefined
            ? data.bodyWeight
            : existingLog.bodyWeight,
        name: data.name !== undefined ? data.name : existingLog.name,
        splitName:
          data.splitName !== undefined
            ? data.splitName
            : existingLog.splitName,
        exercises: mergedExercises,
        updatedAt,
        id: existingLog._id.toString(),
      };
    } else {
      const logData = {
        userId: new ObjectId(userId),
        date: startOfDay,
        bodyWeight: data.bodyWeight,
        name: data.name,
        splitName: data.splitName,
        exercises: data.exercises,
        createdAt: new Date(),
      };
      const result = await db.collection("WorkoutLog").insertOne(logData);
      log = { ...logData, id: result.insertedId.toString() };
    }

    if (updateTemplate) {
      const targetDate = date ? new Date(date) : new Date();
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const dayOfWeek = targetDate.getDay();

      // Find the plan that was "active" on that day
      const activePlan = await db.collection("PlanDocument").findOne(
        {
          userId: new ObjectId(userId),
          startDate: { $lte: targetDateStr }
        },
        { sort: { startDate: -1 } }
      );

      if (activePlan) {
        // Find the Master Template (Week 1) for this plan and day
        const template = await db.collection("WorkoutTemplate").findOne({
          userId: new ObjectId(userId),
          planId: activePlan._id.toString(),
          weekNumber: 1,
          dayOfWeek,
        });

        if (template) {
          const updatedExercises = (template.exercises as Exercise[]).map((ex) => {
            const sessionEx = data.exercises.find(
              (se) => se.exerciseId === ex.exerciseId
            );
            if (sessionEx && sessionEx.sets.length > 0) {
              const maxSessionWeight = Math.max(
                ...sessionEx.sets.map((s) => s.weight)
              );
              // Only update if the session weight is higher than current target (as requested)
              // OR just update it if the user checked the box. Usually, we update to newest performance.
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
    }
    
    // UPDATE EXERCISE RECORDS
    await updateExerciseRecords(new ObjectId(userId), data.exercises, startOfDay);

    revalidatePath("/");
    return JSON.parse(JSON.stringify(log)) as WorkoutLog;
  } catch (error) {
    console.error("Error saving workout session:", error);
    throw new Error("Failed to save workout session.");
  }
}

export async function getTodayBodyWeight(date?: string | Date): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Target date normalized
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const log = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay },
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

export async function saveBodyWeight(bodyWeight: number, date?: string | Date): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Target date normalized
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // See if there's an existing log for that date
    const existingLog = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
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
        date: startOfDay,
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
  updateTemplate: boolean,
  date?: string | Date
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find log for that date
    const existingLog = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      { sort: { date: -1 } }
    );

    if (!existingLog) {
      // Should ideally not happen if they come from Step 1, but let's be safe
      await db.collection("WorkoutLog").insertOne({
        userId,
        date: startOfDay,
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
      const targetDate = date ? new Date(date) : new Date();
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const dayOfWeek = targetDate.getDay();

      const activePlan = await db.collection("PlanDocument").findOne(
        {
          userId: new ObjectId(userId),
          startDate: { $lte: targetDateStr }
        },
        { sort: { startDate: -1 } }
      );

      if (activePlan) {
        const template = await db.collection("WorkoutTemplate").findOne({
          userId: new ObjectId(userId),
          planId: activePlan._id.toString(),
          weekNumber: 1,
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
    }

    // UPDATE EXERCISE RECORDS
    await updateExerciseRecords(userId, [exercise], startOfDay);

    revalidatePath("/");
  } catch (error) {
    console.error("Error saving single exercise log:", error);
    throw new Error("Failed to save exercise.");
  }
}
export async function getTodayWorkoutLog(date?: string | Date): Promise<WorkoutLog | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const log = await db.collection("WorkoutLog").findOne(
      {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
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

    // Use MongoDB aggregation to group logs by local date
    const logs = await db.collection("WorkoutLog").aggregate([
      { $match: { userId } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          id: { $first: { $toString: "$_id" } },
          userId: { $first: { $toString: "$userId" } },
          date: { $first: "$date" },
          bodyWeight: { $max: "$bodyWeight" },
          exercises: { $push: "$exercises" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          id: 1,
          userId: 1,
          date: 1,
          bodyWeight: 1,
          createdAt: 1,
          exercises: {
            $reduce: {
              input: "$exercises",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      { $sort: { date: -1 } }
    ]).toArray();

    return JSON.parse(JSON.stringify(logs)) as WorkoutLog[];
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

export async function getUserStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Get total workouts (unique days)
    const logs = await db.collection("WorkoutLog").find({ userId }).toArray();
    const uniqueDays = new Set(logs.map(log => new Date(log.date).toDateString())).size;

    // Get joined date (from user doc)
    const user = await db.collection("users").findOne({ _id: userId });

    return {
      totalWorkouts: uniqueDays,
      joinedAt: user?.createdAt || user?._id.getTimestamp() || new Date(),
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}

export async function updateExerciseRecords(
  userId: ObjectId,
  exercises: any[],
  date: Date
) {
  const db = await getDb();
  const sessionDate = date instanceof Date ? date : new Date(date);

  for (const exercise of exercises) {
    if (!exercise.sets || exercise.sets.length === 0) continue;

    const maxWeight = Math.max(...exercise.sets.map((s: SetLog) => s.weight || 0));
    const maxReps = Math.max(...exercise.sets
      .filter((s: SetLog) => (s.weight || 0) === maxWeight)
      .map((s: SetLog) => s.reps || 0));
      
    const totalSets = exercise.sets.length;
    const totalReps = exercise.sets.reduce((acc: number, s: SetLog) => acc + (s.reps || 0), 0);
    const exerciseId = exercise.exerciseId;

    // We use a findOne and manual check instead of just $max so we can track prDate and previousPR
    const existing = await db.collection("ExerciseRecords").findOne({ userId, exerciseId });

    const historyEntry = {
      date: sessionDate,
      maxWeight,
      totalSets,
      totalReps,
    };

    if (!existing) {
      await db.collection("ExerciseRecords").insertOne({
        userId,
        exerciseId,
        exerciseName: exercise.name,
        currentPR: maxWeight,
        currentPRReps: maxReps,
        prDate: sessionDate,
        previousPR: 0,
        history: [historyEntry],
        updatedAt: new Date(),
      });
    } else {
      // NEW PR LOGIC:
      // 1. maxWeight is strictly higher
      // 2. maxWeight is same AND maxReps is strictly higher
      const isWeightPR = maxWeight > (existing.currentPR || 0);
      const isRepPR = maxWeight === existing.currentPR && maxReps > (existing.currentPRReps || 0);
      const isNewPR = isWeightPR || isRepPR;
      
      // Update history: if there's an entry for the same day, replace it, otherwise push
      const existingHistory = existing.history || [];
      const sameDayIndex = existingHistory.findIndex((h: any) => 
        new Date(h.date).toDateString() === sessionDate.toDateString()
      );

      const updateOps: any = {
        $set: { 
          exerciseName: exercise.name,
          updatedAt: new Date()
        }
      };

      if (sameDayIndex > -1) {
        updateOps.$set[`history.${sameDayIndex}`] = historyEntry;
      } else {
        updateOps.$push = { history: historyEntry };
      }

      if (isNewPR) {
        updateOps.$set.previousPR = existing.currentPR;
        updateOps.$set.currentPR = maxWeight;
        updateOps.$set.currentPRReps = maxReps;
        updateOps.$set.prDate = sessionDate;
      }

      await db.collection("ExerciseRecords").updateOne(
        { _id: existing._id },
        updateOps
      );
    }
  }
}
