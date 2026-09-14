"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { WorkoutLog, Exercise, SetLog, ThisWeekWeightSummary, WeekDayWeight } from "@/types/workout";
import { calculateEpley } from "@/lib/epley";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

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

export async function startWorkoutSession(
  name?: string,
  splitName?: string,
  date?: string | Date
): Promise<string> {
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

    const existingLog = await db.collection("WorkoutLog").findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingLog) {
      if (!existingLog.startedAt) {
        await db.collection("WorkoutLog").updateOne(
          { _id: existingLog._id },
          { $set: { startedAt: new Date() } }
        );
      }
      return existingLog._id.toString();
    } else {
      const result = await db.collection("WorkoutLog").insertOne({
        userId,
        date: startOfDay,
        name,
        splitName,
        exercises: [],
        startedAt: new Date(),
        createdAt: new Date(),
      });
      return result.insertedId.toString();
    }
  } catch (error) {
    console.error("Error starting workout session:", error);
    throw new Error("Failed to start session.");
  }
}

export async function saveWorkoutSession(
  data: {
    bodyWeight?: number;
    name?: string;
    splitName?: string;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: Array<{ weight: number; reps: number }>;
      isDone?: boolean;
      isSkipped?: boolean;
    }>;
    startedAt?: Date | string; // Optional startedAt from client
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
    const completedAt = new Date();
    let durationSeconds: number | undefined;

    if (data.startedAt) {
      const start = new Date(data.startedAt);
      durationSeconds = Math.round((completedAt.getTime() - start.getTime()) / 1000);
    }

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
            completedAt,
            durationSeconds: durationSeconds || existingLog.durationSeconds,
            updatedAt,
          },
        }
      );

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
        completedAt,
        durationSeconds: durationSeconds || existingLog.durationSeconds,
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
        completedAt,
        durationSeconds,
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
          startDate: { $lte: targetDateStr },
          status: { $ne: 'draft' }
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
    revalidatePath("/analytics");
    revalidatePath("/workouts");
    return JSON.parse(JSON.stringify(log)) as WorkoutLog;
  } catch (error) {
    console.error("Error saving workout session:", error);
    throw new Error("Failed to save workout session.");
  }
}

export async function getTodayBodyWeight(date?: string | Date, overrideUserId?: string): Promise<number | null> {
  try {
    let userIdStr = overrideUserId;
    if (!userIdStr) {
      const session = await getServerSession(authOptions);
      if (!session?.user) return null;
      userIdStr = (session.user as any).id;
    }
    const userId = new ObjectId(userIdStr);

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
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error saving body weight:", error);
    throw new Error("Failed to save body weight.");
  }
}

export async function getThisWeekWeightData(
  overrideUserId?: string,
  referenceDate?: string | Date
): Promise<ThisWeekWeightSummary> {
  try {
    let userIdStr = overrideUserId;
    if (!userIdStr) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return {
          days: [],
          currentWeight: null,
          startWeight: null,
          changeKg: null,
          changeDirection: null,
          loggedCountThisWeek: 0,
        };
      }
      userIdStr = (session.user as any).id;
    }
    const userId = new ObjectId(userIdStr);
    const db = await getDb();

    const now = referenceDate ? new Date(referenceDate) : new Date();
    // Sunday-start week convention
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    // Fetch all logs this week that have a valid bodyWeight
    const weekLogs = await db
      .collection("WorkoutLog")
      .find({
        userId,
        date: { $gte: sunday, $lte: saturday },
        bodyWeight: { $exists: true, $ne: null, $gt: 0 },
      })
      .sort({ date: 1 })
      .project({ date: 1, bodyWeight: 1 })
      .toArray();

    // Map logs by yyyy-MM-dd
    const weightByDateStr = new Map<string, number>();
    for (const log of weekLogs) {
      const dStr = format(new Date(log.date), "yyyy-MM-dd");
      weightByDateStr.set(dStr, Math.round(Number(log.bodyWeight) * 10) / 10);
    }

    const todayStr = format(now, "yyyy-MM-dd");
    const days: WeekDayWeight[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = format(d, "yyyy-MM-dd");
      const isToday = dateStr === todayStr;
      const isFuture = d > now && !isToday;
      const weight = weightByDateStr.get(dateStr) ?? null;

      days.push({
        dayName: format(d, "EEE"),
        dateStr,
        weight,
        isToday,
        isFuture,
      });
    }

    // Latest prior log before this week for baseline
    const priorLog = await db
      .collection("WorkoutLog")
      .findOne(
        {
          userId,
          date: { $lt: sunday },
          bodyWeight: { $exists: true, $ne: null, $gt: 0 },
        },
        { sort: { date: -1 }, projection: { date: 1, bodyWeight: 1 } }
      );

    const priorWeight = priorLog?.bodyWeight
      ? Math.round(Number(priorLog.bodyWeight) * 10) / 10
      : null;

    // Chronological logged weights this week
    const loggedThisWeek = days
      .filter((d) => d.weight !== null)
      .map((d) => d.weight as number);

    let currentWeight: number | null = null;
    let startWeight: number | null = null;
    let changeKg: number | null = null;
    let changeDirection: "up" | "down" | "neutral" | null = null;

    if (loggedThisWeek.length > 0) {
      currentWeight = loggedThisWeek[loggedThisWeek.length - 1];
      startWeight = priorWeight !== null ? priorWeight : loggedThisWeek[0];
      const diff = Math.round((currentWeight - startWeight) * 10) / 10;
      changeKg = diff;
      changeDirection =
        diff > 0.05 ? "up" : diff < -0.05 ? "down" : "neutral";
    } else if (priorWeight !== null) {
      currentWeight = priorWeight;
      startWeight = priorWeight;
      changeKg = 0;
      changeDirection = "neutral";
    }

    return {
      days,
      currentWeight,
      startWeight,
      changeKg,
      changeDirection,
      loggedCountThisWeek: loggedThisWeek.length,
    };
  } catch (error) {
    console.error("Error fetching this week weight data:", error);
    return {
      days: [],
      currentWeight: null,
      startWeight: null,
      changeKg: null,
      changeDirection: null,
      loggedCountThisWeek: 0,
    };
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
          startDate: { $lte: targetDateStr },
          status: { $ne: 'draft' }
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
    revalidatePath("/analytics");
    revalidatePath("/workouts");
  } catch (error) {
    console.error("Error saving single exercise log:", error);
    throw new Error("Failed to save exercise.");
  }
}
export async function getTodayWorkoutLog(date?: string | Date, overrideUserId?: string): Promise<WorkoutLog | null> {
  try {
    let userIdStr = overrideUserId;
    if (!userIdStr) {
      const session = await getServerSession(authOptions);
      if (!session?.user) return null;
      userIdStr = (session.user as any).id;
    }
    const userId = new ObjectId(userIdStr);

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

export async function getWorkoutHistory(
  overrideUserId?: string,
  year?: number,
  month?: number
): Promise<WorkoutLog[]> {
  try {
    let userIdStr = overrideUserId;
    if (!userIdStr) {
      const session = await getServerSession(authOptions);
      if (!session?.user) return [];
      userIdStr = (session.user as any).id;
    }
    const userId = new ObjectId(userIdStr);

    const db = await getDb();

    // Build date range filter
    const match: any = { userId };
    if (year !== undefined && month !== undefined) {
      const startOfMonth = new Date(year, month, 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(year, month + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      match.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const rawLogs = await db.collection("WorkoutLog")
      .find(match)
      .sort({ date: -1 })
      .toArray();

    // Group by local date using JS (not $dateToString) to fix UTC/timezone issue
    const dateMap = new Map<string, any>();

    for (const log of rawLogs) {
      const d = log.date instanceof Date ? log.date : new Date(log.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.exercises = [...(existing.exercises || []), ...(log.exercises || [])];
        if (!existing.splitName && log.splitName) existing.splitName = log.splitName;
        if (!existing.name && log.name) existing.name = log.name;
        if (log.bodyWeight) existing.bodyWeight = log.bodyWeight;
        if (log.durationSeconds) existing.durationSeconds = Math.max(existing.durationSeconds || 0, log.durationSeconds);
        if (log.completedAt) existing.completedAt = log.completedAt;
      } else {
        dateMap.set(dateKey, {
          id: log._id.toString(),
          userId: log.userId.toString(),
          date: dateKey,
          name: log.name || 'Workout',
          splitName: log.splitName,
          bodyWeight: log.bodyWeight,
          durationSeconds: log.durationSeconds,
          startedAt: log.startedAt,
          completedAt: log.completedAt,
          createdAt: log.createdAt,
          exercises: [...(log.exercises || [])],
        });
      }
    }

    // Convert to sorted array
    const logs = Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, log]) => log);

    return JSON.parse(JSON.stringify(logs)) as WorkoutLog[];
  } catch (error) {
    console.error("Error getting workout history:", error);
    return [];
  }
}

export async function getWorkoutByDate(dateStr: string, overrideUserId?: string): Promise<WorkoutLog | null> {
  try {
    let userIdStr = overrideUserId;
    if (!userIdStr) {
      const session = await getServerSession(authOptions);
      if (!session?.user) return null;
      userIdStr = (session.user as any).id;
    }
    const userId = new ObjectId(userIdStr);

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

export async function deleteWorkoutLog(logId: string): Promise<{ success: boolean }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Load the log first so we can scrub its data from ExerciseRecords
    const log = await db.collection("WorkoutLog").findOne({
      _id: new ObjectId(logId),
      userId,
    });
    if (!log) return { success: false };

    await db.collection("WorkoutLog").deleteOne({ _id: log._id });

    // Remove this session's entries from each exercise's PR history and
    // recompute currentPR / previousPR from whatever history remains.
    const logDay = new Date(log.date).toDateString();
    const exercises: any[] = log.exercises || [];

    for (const ex of exercises) {
      if (!ex.exerciseId) continue;
      const record = await db.collection("ExerciseRecords").findOne({
        userId,
        exerciseId: ex.exerciseId,
      });
      if (!record) continue;

      const remaining = (record.history || []).filter(
        (h: any) => new Date(h.date).toDateString() !== logDay,
      );

      // No history left — the record is meaningless, drop it entirely
      if (remaining.length === 0) {
        await db.collection("ExerciseRecords").deleteOne({ _id: record._id });
        continue;
      }

      // Recompute PR fields from remaining history (best weight, ties broken
      // by reps — mirrors the logic in updateExerciseRecords)
      const sorted = [...remaining].sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      let currentPR = 0;
      let currentPRReps = 0;
      let previousPR = 0;
      let prDate: Date | null = null;

      for (const h of sorted) {
        const w = h.maxWeight || 0;
        const r = h.maxReps || 0;
        if (w > currentPR || (w === currentPR && r > currentPRReps)) {
          previousPR = currentPR;
          currentPR = w;
          currentPRReps = r;
          prDate = h.date;
        }
      }

      await db.collection("ExerciseRecords").updateOne(
        { _id: record._id },
        {
          $set: {
            history: remaining,
            currentPR,
            currentPRReps,
            previousPR,
            prDate,
            updatedAt: new Date(),
          },
        },
      );
    }

    revalidatePath("/workouts");
    revalidatePath("/");
    revalidatePath("/analytics");
    return { success: true };
  } catch (error) {
    console.error("Error deleting workout log:", error);
    return { success: false };
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
    // Skip exercises not actually completed (isDone !== true), skipped, or with no sets
    if (exercise.isSkipped || exercise.isDone === false || !exercise.sets || exercise.sets.length === 0) continue;

    // Use completed sets if any exist, otherwise use all sets that have values
    // This handles users forgetting to check the boxes but still finishing the workout.
    let targetSets = exercise.sets.filter((s: SetLog) => s.completed);
    if (targetSets.length === 0) {
      targetSets = exercise.sets.filter((s: SetLog) => (s.weight || 0) > 0 || (s.reps || 0) > 0);
    }
    
    if (targetSets.length === 0) continue;

    // Find the set that gives the highest estimated 1RM (Epley)
    const bestORMSet = targetSets.reduce((prev: SetLog, curr: SetLog) => {
      const prevEst = calculateEpley(prev.weight || 0, prev.reps || 0) || 0;
      const currEst = calculateEpley(curr.weight || 0, curr.reps || 0) || 0;
      return currEst > prevEst ? curr : prev;
    }, targetSets[0]);

    const maxWeight = bestORMSet.weight || 0;
    const maxReps = bestORMSet.reps || 0;
      
    const totalSets = targetSets.length;
    const totalReps = targetSets.reduce((acc: number, s: SetLog) => acc + (s.reps || 0), 0);
    const exerciseId = exercise.exerciseId;
    const exerciseName = exercise.name.trim();

    // Match by ID OR Name (case-insensitive) to avoid split records
    let existing = null;
    if (exerciseId) {
      existing = await db.collection("ExerciseRecords").findOne({ 
        userId, 
        exerciseId
      });
    }
    
    if (!existing) {
      existing = await db.collection("ExerciseRecords").findOne({ 
        userId, 
        exerciseName: { $regex: new RegExp(`^${exerciseName}$`, "i") }
      });
    }


    const historyEntry = {
      date: sessionDate,
      maxWeight,
      maxWeightReps: maxReps, // Added for accurate 1RM tracking
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
      const isWeightPR = maxWeight > (existing.currentPR || 0);
      const isRepPR = maxWeight === existing.currentPR && maxReps > (existing.currentPRReps || 0);
      const isNewPR = isWeightPR || isRepPR;
      
      const existingHistory = existing.history || [];
      const sameDayIndex = existingHistory.findIndex((h: any) => 
        new Date(h.date).toDateString() === sessionDate.toDateString()
      );

      const updateOps: any = {
        $set: { 
          exerciseId,
          exerciseName: exercise.name,
          updatedAt: new Date()
        }
      };

      if (sameDayIndex > -1) {
        const existingEntry = existingHistory[sameDayIndex];
        // Always update same day if we have data, but keep the highest maxWeight
        if (maxWeight >= (existingEntry.maxWeight || 0)) {
           updateOps.$set[`history.${sameDayIndex}`] = historyEntry;
        }
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
