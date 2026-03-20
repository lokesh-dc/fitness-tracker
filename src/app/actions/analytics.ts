"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { WeightTrendData, SetLog, ExerciseTimelineEntry } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getHighestWeightPR(exerciseName: string): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 0;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const record = await db.collection("ExerciseRecords").findOne({ userId, exerciseName });
    
    return record?.currentPR || 0;
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
    const records = await db.collection("ExerciseRecords")
      .find({ userId, exerciseId: { $in: exerciseIds } })
      .toArray();

    const prMap: Record<string, number> = {};
    records.forEach(doc => {
      prMap[doc.exerciseId] = doc.currentPR;
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
    
    const records = await db.collection("ExerciseRecords")
      .find({ userId, currentPR: { $gt: 0 } })
      .sort({ prDate: -1 })
      .limit(3)
      .toArray();

    return records.map(doc => ({
      name: doc.exerciseName,
      weight: doc.currentPR,
      date: doc.prDate instanceof Date ? doc.prDate.toISOString() : doc.prDate,
      increment: doc.previousPR > 0 ? Number((doc.currentPR - doc.previousPR).toFixed(2)) : 0
    }));
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

    // Get the record for PR and history
    const record = await db.collection("ExerciseRecords").findOne({ userId, exerciseName });

    let suggestedSets = 3;
    let suggestedReps = 10;
    let lastWeight = 0;
    let pr = record?.currentPR || 0;

    if (record && record.history && record.history.length > 0) {
      // Get the latest history entry
      const latest = record.history[record.history.length - 1];
      suggestedSets = latest.totalSets || 3;
      suggestedReps = Math.round((latest.totalReps / latest.totalSets)) || 10;
      lastWeight = latest.maxWeight || 0;
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
      const dateStr = (log.date as Date).toISOString().split('T')[0];
      
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
    const records = await db.collection("ExerciseRecords").find({ userId }).toArray();
    const names = records.map(r => r.exerciseName).filter(Boolean);
    return Array.from(new Set(names)).sort();
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
    const record = await db.collection("ExerciseRecords").findOne({ userId, exerciseName });

    if (!record || !record.history) return [];

    return record.history.map((h: any) => ({
      date: h.date instanceof Date ? h.date.toISOString() : h.date,
      weight: h.maxWeight
    }));
  } catch (error) {
    console.error("Error fetching exercise progress:", error);
    return [];
  }
}

export async function getExerciseTimeline(
  exerciseName: string,
  from?: Date,
  to?: Date
): Promise<ExerciseTimelineEntry[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    const pipeline: any[] = [
      {
        $match: {
          userId,
          ...(from || to ? {
            date: {
              ...(from ? { $gte: from } : {}),
              ...(to ? { $lte: to } : {}),
            }
          } : {})
        }
      },
      { $unwind: '$exercises' },
      {
        $match: {
          'exercises.name': exerciseName,
          'exercises.isDone': true
        }
      },
      { $unwind: '$exercises.sets' },
      {
        $match: {
          'exercises.sets.weight': { $gt: 0 },
          'exercises.sets.reps': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$date',
          maxWeight: { $max: '$exercises.sets.weight' },
          totalVolume: {
            $sum: {
              $multiply: ['$exercises.sets.weight', '$exercises.sets.reps']
            }
          },
          totalReps: { $sum: '$exercises.sets.reps' },
          totalSets: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 200 }
    ];

    const results = await db.collection('WorkoutLog').aggregate(pipeline).toArray();

    // Fetch prDate from ExerciseRecords for PR marker
    const record = await db.collection('ExerciseRecords').findOne(
      { userId, exerciseName },
      { projection: { prDate: 1 } }
    );
    
    // Normalize prDate for string comparison
    const prDateStr = record?.prDate 
      ? new Date(record.prDate).toISOString().split('T')[0]
      : null;

    return results.map(r => {
      const avgRepsPerSet = r.totalSets > 0
        ? Math.round(r.totalReps / r.totalSets)
        : 1;

      // Use maxWeight and avgReps for the 1RM estimation as per plan
      const estimatedOneRM = calculateOneRM(r.maxWeight, avgRepsPerSet);
      
      const currentEntryDate = new Date(r._id);

      return {
        date: currentEntryDate.toISOString(),
        maxWeight: r.maxWeight,
        estimatedOneRM,
        totalVolume: r.totalVolume,
        totalSets: r.totalSets,
        totalReps: r.totalReps,
        avgRepsPerSet,
        isPR: currentEntryDate.toISOString().split('T')[0] === prDateStr,
      };
    });

  } catch (error) {
    console.error("Error fetching exercise timeline:", error);
    return [];
  }
}

function calculateOneRM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * STREAK DATA
 */
export async function getStreakData(): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const logs = await db.collection("WorkoutLog")
      .find({ userId })
      .sort({ date: -1 })
      .project({ date: 1 })
      .toArray();

    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };

    // Unique dates (normalized to YYYY-MM-DD)
    const uniqueDates = Array.from(new Set(
      logs.map(l => new Date(l.date).toISOString().split('T')[0])
    ));

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Last workout date
    const lastWorkoutDate = uniqueDates[0];

    // Current Streak logic: allow 1 day grace (today or yesterday start)
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      let checkDate = new Date(uniqueDates[0]);
      for (const dStr of uniqueDates) {
        const d = new Date(dStr);
        const diff = Math.round((checkDate.getTime() - d.getTime()) / 86400000);
        
        if (diff <= 1) {
          currentStreak++;
          checkDate = d;
        } else {
          break;
        }
      }
    }

    // Longest Streak logic
    let checkDateLong = new Date(uniqueDates[0]);
    for (const dStr of uniqueDates) {
      const d = new Date(dStr);
      const diff = Math.round((checkDateLong.getTime() - d.getTime()) / 86400000);
      
      if (diff <= 1) {
        tempStreak++;
        checkDateLong = d;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        checkDateLong = d;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, lastWorkoutDate };
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
  }
}

/**
 * MONTH WORKOUT DATES (FOR HEATMAP)
 */
export async function getMonthWorkoutDates(year: number, month: number): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = new ObjectId((session.user as any).id);

    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0, 23, 59, 59);

    const db = await getDb();
    const logs = await db.collection("WorkoutLog").find({
      userId,
      date: { $gte: from, $lte: to }
    }).project({ date: 1 }).toArray();

    return Array.from(new Set(
      logs.map(l => new Date(l.date).toISOString().split('T')[0])
    ));
  } catch (error) {
    console.error("Error fetching month workout dates:", error);
    return [];
  }
}

/**
 * WEEK SNAPSHOT
 */
export async function getWeekSnapshot(): Promise<{
  sessionsCompleted: number;
  sessionsPlanned: number;
  completedDays: number[];
  plannedDays: number[];
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { sessionsCompleted: 0, sessionsPlanned: 0, completedDays: [], plannedDays: [] };
    const userId = new ObjectId((session.user as any).id);

    const now = new Date();
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const db = await getDb();
    const logs = await db.collection("WorkoutLog").find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    }).project({ date: 1 }).toArray();

    const completedDays = Array.from(new Set(
      logs.map(l => {
        const d = new Date(l.date);
        return d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon, 6=Sun
      })
    ));

    // Get active plan from PlanDocument
    const activePlan = await db.collection("PlanDocument").findOne(
      { userId, startDate: { $lte: now.toISOString().split('T')[0] } },
      { sort: { startDate: -1 } }
    );

    const plannedDays: number[] = [];
    if (activePlan) {
      const startDate = new Date(activePlan.startDate + "T00:00:00");
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7) + 1;

      if (weekIndex <= activePlan.numWeeks) {
        const templates = await db.collection("WorkoutTemplate").find({
          planId: activePlan._id.toString(),
          userId,
          "exercises.0": { $exists: true }
        }).toArray();

        templates.forEach(t => {
          // 0=Sun, 1=Mon ... -> Map to 0=Mon ... 6=Sun
          const normalizedDay = t.dayOfWeek === 0 ? 6 : t.dayOfWeek - 1;
          plannedDays.push(normalizedDay);
        });
      }
    }

    return {
      sessionsCompleted: completedDays.length,
      sessionsPlanned: plannedDays.length || 0,
      completedDays,
      plannedDays
    };
  } catch (error) {
    console.error("Error fetching week snapshot:", error);
    return { sessionsCompleted: 0, sessionsPlanned: 0, completedDays: [], plannedDays: [] };
  }
}

/**
 * NEXT PLANNED WORKOUT
 */
export async function getNextPlannedWorkout(): Promise<{
  name: string;
  scheduledDay: string;
  exercises: string[];
  totalExercises: number;
} | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Find active plan
    const activePlan = await db.collection("PlanDocument").findOne(
      { userId, startDate: { $lte: todayStr } },
      { sort: { startDate: -1 } }
    );

    if (!activePlan) return null;

    const startDate = new Date(activePlan.startDate + "T00:00:00");
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7) + 1;

    if (weekIndex > activePlan.numWeeks) return null;

    // Find templates for this plan
    const templates = await db.collection("WorkoutTemplate").find({
      planId: activePlan._id.toString(),
      userId,
      "exercises.0": { $exists: true }
    }).toArray();

    if (templates.length === 0) return null;

    const todayDay = now.getDay(); // 0=Sun, 1=Mon

    // Find next day with exercises from today forward (up to 7 days)
    let nextTemplate = null;
    let daysDiff = -1;

    for (let i = 0; i < 7; i++) {
      const checkDay = (todayDay + i) % 7;
      const t = templates.find(temp => temp.dayOfWeek === checkDay);
      
      if (t) {
        // If today, check if already logged
        if (i === 0) {
          const startOfToday = new Date(now);
          startOfToday.setHours(0,0,0,0);
          const todayLog = await db.collection("WorkoutLog").findOne({ 
            userId, 
            date: { $gte: startOfToday } 
          });
          if (todayLog && todayLog.exercises?.length > 0) continue;
        }
        nextTemplate = t;
        daysDiff = i;
        break;
      }
    }

    if (!nextTemplate) return null;

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let scheduledDay = dayNames[nextTemplate.dayOfWeek];
    if (daysDiff === 0) scheduledDay = "Today";
    if (daysDiff === 1) scheduledDay = "Tomorrow";

    return {
      name: nextTemplate.splitName || "Workout",
      scheduledDay,
      exercises: nextTemplate.exercises.slice(0, 3).map((e: any) => e.name),
      totalExercises: nextTemplate.exercises.length
    };
  } catch (error) {
    console.error("Error fetching next planned workout:", error);
    return null;
  }
}
