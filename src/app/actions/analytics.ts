"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { 
  WeightTrendData, 
  SetLog, 
  ExerciseTimelineEntry, 
  MostImprovedExercise, 
  WeeklyVolumeComparison,
  BodyWeightTrend,
  AllTimeStats,
  AccountSummary
} from "@/types/workout";
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

    // Helper to get local YYYY-MM-DD reliably
    const getLocalDayString = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const parseLocalDayString = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d); // local midnight
    };

    const logs = await db.collection("WorkoutLog")
      .find({ userId })
      .sort({ date: -1 })
      .project({ date: 1, exercises: 1 })
      .toArray();

    const validLogs = logs.filter(l => l.exercises && l.exercises.length > 0);
    const uniqueDates = Array.from(new Set(
      validLogs.map(l => getLocalDayString(new Date(l.date)))
    ));

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    let earliestDate = new Date(todayDate.getTime());
    if (uniqueDates.length > 0) {
      const oldestLog = parseLocalDayString(uniqueDates[uniqueDates.length - 1]);
      if (oldestLog < earliestDate) earliestDate = oldestLog;
    }

    const allPlans = await db.collection("PlanDocument").find({ userId }).toArray();
    for (const plan of allPlans) {
      const [y, m, d] = plan.startDate.split('-').map(Number);
      const pStart = new Date(y, m - 1, d); // robust local parser for YYYY-MM-DD
      if (pStart < earliestDate) earliestDate = pStart;
    }

    const planIds = allPlans.map(p => p._id.toString());
    const templates = await db.collection("WorkoutTemplate").find({
      planId: { $in: planIds },
      userId,
      "exercises.0": { $exists: true }
    }).toArray();

    const diffTime = todayDate.getTime() - earliestDate.getTime();
    const totalDays = Math.round(diffTime / 86400000) + 1;

    const logSet = new Set(uniqueDates);

    let tempStreak = 0;
    let longestStreak = 0;

    for (let i = 0; i < totalDays; i++) {
      const dDate = new Date(earliestDate.getTime());
      dDate.setDate(dDate.getDate() + i);
      const dStr = getLocalDayString(dDate);

      const isLogged = logSet.has(dStr);
      let isPlannedDay = false;
      const systemDay = dDate.getDay();

      for (const plan of allPlans) {
        const [py, pm, pd] = plan.startDate.split('-').map(Number);
        const planStart = new Date(py, pm - 1, pd);
        const planEnd = new Date(planStart.getTime());
        planEnd.setDate(planEnd.getDate() + plan.numWeeks * 7 - 1);

        if (dDate >= planStart && dDate <= planEnd) {
          const diffInDays = Math.round((dDate.getTime() - planStart.getTime()) / 86400000);
          const currentWeekIndex = Math.floor(diffInDays / 7) + 1;
          const hasSpecificWeekTemplates = templates.some(t => t.planId === plan._id.toString() && t.dayOfWeek === systemDay && t.weekNumber === currentWeekIndex);
          const hasWeek1Templates = templates.some(t => t.planId === plan._id.toString() && t.dayOfWeek === systemDay && t.weekNumber === 1);

          if (hasSpecificWeekTemplates || hasWeek1Templates) {
            isPlannedDay = true;
            break;
          }
        }
      }

      if (isLogged) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (isPlannedDay) {
        // Missed planned workout. Break if it's not today.
        if (i !== totalDays - 1) {
          tempStreak = 0;
        }
      }
    }

    return {
      currentStreak: tempStreak,
      longestStreak,
      lastWorkoutDate: uniqueDates[0] || null
    };
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
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

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
        const allTemplates = await db.collection("WorkoutTemplate").find({
          planId: activePlan._id.toString(),
          userId,
          "exercises.0": { $exists: true }
        }).toArray();

        for (let d = 0; d < 7; d++) {
          const hasSpecificWeek = allTemplates.some(t => t.dayOfWeek === d && t.weekNumber === weekIndex);
          const hasWeek1 = allTemplates.some(t => t.dayOfWeek === d && t.weekNumber === 1);

          if (hasSpecificWeek || hasWeek1) {
            const normalizedDay = d === 0 ? 6 : d - 1;
            plannedDays.push(normalizedDay);
          }
        }
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
          startOfToday.setHours(0, 0, 0, 0);
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

export async function getMostTrainedMuscleGroups(userIdStr: string, limit: number = 5) {
  try {
    const db = await getDb();
    const userId = new ObjectId(userIdStr);

    const pipeline = [
      { $match: { userId } },
      { $unwind: '$exercises' },
      // { $match: { 'exercises.isDone': true } },
      { $unwind: '$exercises.sets' },
      {
        $match: {
          'exercises.sets.weight': { $gt: 0 },
          'exercises.sets.reps': { $gt: 0 },
        }
      },
      {
        $lookup: {
          from: 'Exercises',
          localField: 'exercises.name',
          foreignField: 'name',
          as: 'exerciseDetails'
        }
      },
      {
        $unwind: {
          path: '$exerciseDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$exerciseDetails.muscleGroup',
          totalVolume: {
            $sum: {
              $multiply: [
                '$exercises.sets.weight',
                '$exercises.sets.reps'
              ]
            }
          }
        }
      },
      { $sort: { totalVolume: -1 } },
      { $limit: limit },
    ];

    const results = await db.collection('WorkoutLog').aggregate(pipeline).toArray();
    const grandTotal = results.reduce((acc, r) => acc + r.totalVolume, 0);

    return results.map(r => ({
      muscleGroup: r._id || 'Unknown',
      totalVolume: Math.round(r.totalVolume),
      percentageOfTotal: grandTotal > 0 ? Math.round((r.totalVolume / grandTotal) * 100) : 0,
    }));
  } catch (err) {
    console.error("Error in getMostTrainedMuscleGroups:", err);
    return [];
  }
}

export async function getMonthlyVolumeTrend(userIdStr: string, months: number = 6) {
  try {
    const db = await getDb();
    const userId = new ObjectId(userIdStr);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const pipeline = [
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      { $unwind: '$exercises' },
      // { $match: { 'exercises.isDone': true } },
      { $unwind: '$exercises.sets' },
      {
        $match: {
          'exercises.sets.weight': { $gt: 0 },
          'exercises.sets.reps': { $gt: 0 },
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalVolume: {
            $sum: {
              $multiply: [
                '$exercises.sets.weight',
                '$exercises.sets.reps'
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const results = await db.collection('WorkoutLog').aggregate(pipeline).toArray();

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const volumeArray = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const found = results.find(r => r._id.year === year && r._id.month === month);

      return {
        month: monthLabels[d.getMonth()],
        year,
        totalVolume: found ? Math.round(found.totalVolume) : 0,
      };
    });

    const current = volumeArray[volumeArray.length - 1].totalVolume;
    const previous = volumeArray[volumeArray.length - 2]?.totalVolume ?? 0;
    const trendPercent = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

    return { months: volumeArray, trendPercent };
  } catch (err) {
    console.error("Error in getMonthlyVolumeTrend:", err);
    return { months: [], trendPercent: null };
  }
}

export async function getMissedWorkoutsThisMonth(userIdStr: string) {
  try {
    const db = await getDb();
    const userId = new ObjectId(userIdStr);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const loggedDocs = await db.collection('WorkoutLog').find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    }).project({ date: 1, exercises: 1 }).toArray();

    // Only count logs that have at least one exercise
    const validLogs = loggedDocs.filter(l => l.exercises && l.exercises.length > 0);
    const loggedDates = new Set(validLogs.map(l => new Date(l.date).toDateString()));
    const sessionsLogged = loggedDates.size;

    // Find the most recent active plan
    const activePlan = await db.collection('PlanDocument').findOne({
      userId,
      startDate: { $lte: now.toISOString().split('T')[0] }
    }, { sort: { startDate: -1 } });

    if (!activePlan) {
      return {
        sessionsLogged,
        sessionsPlanned: 0,
        sessionsMissed: 0,
        completionPercent: 100,
        hasActivePlan: false,
      };
    }

    // Get templates for this plan that have exercises
    const templates = await db.collection('WorkoutTemplate').find({
      planId: activePlan._id.toString(),
      userId,
      'exercises.0': { $exists: true }
    }).toArray();

    if (!templates.length) {
      return {
        sessionsLogged,
        sessionsPlanned: 0,
        sessionsMissed: 0,
        completionPercent: 100,
        hasActivePlan: false,
      };
    }

    let sessionsPlanned = 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const planStart = new Date(activePlan.startDate + "T00:00:00");

    // Iterate from month start to today or month end
    const cursor = new Date(monthStart);
    while (cursor <= today && cursor <= monthEnd) {
      // Check if plan was active on this day
      if (cursor >= planStart) {
        const dayOfWeek = cursor.getDay();

        // Calculate week index relative to plan start
        const diffInDays = Math.floor((cursor.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffInDays / 7) + 1;

        if (weekIndex <= activePlan.numWeeks) {
          const hasSession = templates.some(t =>
            t.dayOfWeek === dayOfWeek && (t.weekNumber === weekIndex || t.weekNumber === 1)
          );
          if (hasSession) sessionsPlanned++;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const sessionsMissed = Math.max(0, sessionsPlanned - sessionsLogged);
    const completionPercent = sessionsPlanned > 0
      ? Math.min(100, Math.round((sessionsLogged / sessionsPlanned) * 100))
      : 100;

    return {
      sessionsLogged,
      sessionsPlanned,
      sessionsMissed,
      completionPercent: sessionsPlanned > 0 ? Math.round((sessionsLogged / sessionsPlanned) * 100) : 100,
      hasActivePlan: true,
    };
  } catch (err) {
    console.error("Error in getMissedWorkoutsThisMonth:", err);
    return { sessionsLogged: 0, sessionsPlanned: 0, sessionsMissed: 0, completionPercent: 0, hasActivePlan: false };
  }
}

export async function getMostImprovedExercise(
  userId: string,
  days: number = 30
): Promise<MostImprovedExercise | null> {
  try {
    const db = await getDb();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      // Step 1: Match logs in last 30 days
      {
        $match: {
          userId: new ObjectId(userId),
          date: { $gte: since }
        }
      },

      // Step 2: Unwind exercises
      { $unwind: '$exercises' },

      // Step 3: Only completed exercises
      { $match: { 'exercises.isDone': true } },

      // Step 4: Unwind sets
      { $unwind: '$exercises.sets' },

      // Step 5: Filter zero-weight sets
      {
        $match: {
          'exercises.sets.weight': { $gt: 0 },
          'exercises.sets.reps': { $gt: 0 },
        }
      },

      // Step 6: Group by exercise name + date
      // Get max weight per session per exercise
      {
        $group: {
          _id: {
            exerciseName: '$exercises.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
          },
          maxWeight: { $max: '$exercises.sets.weight' }
        }
      },

      // Step 7: Sort by date ascending within each exercise
      { $sort: { '_id.date': 1 } },

      // Step 8: Group by exercise name — collect all session weights
      {
        $group: {
          _id: '$_id.exerciseName',
          weights: { $push: '$maxWeight' },
          sessionCount: { $sum: 1 }
        }
      },

      // Step 9: Only consider exercises logged at least twice
      { $match: { sessionCount: { $gte: 2 } } },

      // Step 10: Compute improvement
      {
        $addFields: {
          startWeight: { $arrayElemAt: ['$weights', 0] },
          endWeight: { $arrayElemAt: ['$weights', -1] },
        }
      },
      {
        $addFields: {
          improvementKg: { $subtract: ['$endWeight', '$startWeight'] },
          improvementPercent: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$endWeight', '$startWeight'] },
                  { $arrayElemAt: ['$weights', 0] }
                ]
              },
              100
            ]
          }
        }
      },

      // Step 11: Only positive improvements
      { $match: { improvementKg: { $gt: 0 } } },

      // Step 12: Sort by improvement % descending, take top 1
      { $sort: { improvementPercent: -1 } },
      { $limit: 1 }
    ];

    const results = await db.collection('WorkoutLog').aggregate(pipeline).toArray();

    if (!results.length) return null;

    const r = results[0];
    return {
      exerciseName: r._id,
      startWeight: Math.round(r.startWeight * 10) / 10,
      endWeight: Math.round(r.endWeight * 10) / 10,
      improvementPercent: Math.round(r.improvementPercent),
      improvementKg: Math.round(r.improvementKg * 10) / 10,
      sessionCount: r.sessionCount,
    };
  } catch (error) {
    console.error("Error in getMostImprovedExercise:", error);
    return null;
  }
}

export async function getWeeklyVolumeComparison(
  userId: string
): Promise<WeeklyVolumeComparison> {
  try {
    const db = await getDb();

    // Get current week Mon 00:00 → Sun 23:59
    function getCurrentWeekRange(): { start: Date; end: Date } {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday };
    }

    const thisWeek = getCurrentWeekRange();
    const lastWeekStart = new Date(thisWeek.start);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeek.end);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    // Volume aggregation helper
    async function getVolumeForRange(
      uid: ObjectId,
      start: Date,
      end: Date
    ): Promise<number> {
      const pipeline = [
        { $match: { userId: uid, date: { $gte: start, $lte: end } } },
        { $unwind: '$exercises' },
        { $match: { 'exercises.isDone': true } },
        { $unwind: '$exercises.sets' },
        {
          $match: {
            'exercises.sets.weight': { $gt: 0 },
            'exercises.sets.reps': { $gt: 0 },
          }
        },
        {
          $group: {
            _id: null,
            totalVolume: {
              $sum: {
                $multiply: [
                  '$exercises.sets.weight',
                  '$exercises.sets.reps'
                ]
              }
            }
          }
        }
      ];

      const result = await db.collection('WorkoutLog').aggregate(pipeline).toArray();
      return result[0]?.totalVolume ?? 0;
    }

    const uid = new ObjectId(userId);
    // Run both in parallel
    const [thisWeekVolume, lastWeekVolume] = await Promise.all([
      getVolumeForRange(uid, thisWeek.start, thisWeek.end),
      getVolumeForRange(uid, lastWeekStart, lastWeekEnd),
    ]);

    const differenceKg = thisWeekVolume - lastWeekVolume;
    const differencePercent = lastWeekVolume > 0
      ? Math.round((differenceKg / lastWeekVolume) * 100)
      : 0;

    return {
      thisWeekVolume: Math.round(thisWeekVolume),
      lastWeekVolume: Math.round(lastWeekVolume),
      differenceKg: Math.round(differenceKg),
      differencePercent,
      trendDirection: differenceKg > 0
        ? 'up'
        : differenceKg < 0 ? 'down' : 'neutral',
    };
  } catch (error) {
    console.error("Error in getWeeklyVolumeComparison:", error);
    return {
      thisWeekVolume: 0,
      lastWeekVolume: 0,
      differenceKg: 0,
      differencePercent: 0,
      trendDirection: 'neutral',
    };
  }
}

export async function getProfileBodyWeightTrend(
  userId: string,
  limit: number = 8
): Promise<BodyWeightTrend> {
  try {
    const db = await getDb();
    
    // Fetch last N WorkoutLogs where bodyWeight exists and is > 0
    const logs = await db.collection('WorkoutLog')
      .find({
        userId: new ObjectId(userId),
        bodyWeight: { $exists: true, $gt: 0 }
      })
      .sort({ date: -1 })
      .limit(limit)
      .project({ date: 1, bodyWeight: 1 })
      .toArray();

    if (!logs.length) {
      return {
        entries: [],
        currentWeight: null,
        firstWeight: null,
        changeKg: null,
        changeDirection: null,
      };
    }

    // Reverse to get ascending order for chart
    const entries = logs
      .reverse()
      .map(l => ({
        date: l.date,
        weight: Math.round(l.bodyWeight * 10) / 10,
      }));

    const currentWeight = entries[entries.length - 1].weight;
    const firstWeight = entries[0].weight;
    const changeKg = Math.round((currentWeight - firstWeight) * 10) / 10;

    return {
      entries,
      currentWeight,
      firstWeight,
      changeKg,
      changeDirection: changeKg > 0.2
        ? 'up'
        : changeKg < -0.2 ? 'down' : 'neutral',
    };
  } catch (error) {
    console.error("Error in getBodyWeightTrend:", error);
    return {
      entries: [],
      currentWeight: null,
      firstWeight: null,
      changeKg: null,
      changeDirection: null,
    };
  }
}

export async function getAllTimeStats(userId: string): Promise<AllTimeStats> {
  try {
    const db = await getDb();
    
    const [workoutStats, prStats, streakDataResult] = await Promise.all([
      // Total workouts + total volume
      db.collection('WorkoutLog').aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: '$exercises' },
        { $match: { 'exercises.isDone': true } },
        { $unwind: '$exercises.sets' },
        {
          $match: {
            'exercises.sets.weight': { $gt: 0 },
            'exercises.sets.reps': { $gt: 0 },
          }
        },
        {
          $group: {
            _id: '$_id',   // group by workout first to count unique sessions
            sessionVolume: {
              $sum: {
                $multiply: [
                  '$exercises.sets.weight',
                  '$exercises.sets.reps'
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalWorkouts: { $sum: 1 },
            totalVolumeKg: { $sum: '$sessionVolume' }
          }
        }
      ]).toArray(),

      // Total PRs broken — count exercises where history has
      // more than 1 entry (each new entry = a PR was broken)
      db.collection('ExerciseRecords').aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $project: {
            prCount: {
              $subtract: [{ $size: { $ifNull: ['$history', []] } }, 1]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalPRsBroken: {
              $sum: {
                $max: ['$prCount', 0] // never negative
              }
            }
          }
        }
      ]).toArray(),

      // Reuse existing streak logic
      getStreakData(),
    ]);

    const stats = workoutStats[0];
    const prs = prStats[0];

    return {
      totalWorkouts: stats?.totalWorkouts ?? 0,
      totalVolumeKg: Math.round(stats?.totalVolumeKg ?? 0),
      totalPRsBroken: prs?.totalPRsBroken ?? 0,
      longestStreakDays: streakDataResult.longestStreak ?? 0,
    };
  } catch (error) {
    console.error("Error in getAllTimeStats:", error);
    return {
      totalWorkouts: 0,
      totalVolumeKg: 0,
      totalPRsBroken: 0,
      longestStreakDays: 0,
    };
  }
}

export async function getAccountSummary(userId: string): Promise<AccountSummary> {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { createdAt: 1 } }
    );

    if (!user) {
      throw new Error("User not found");
    }

    const memberSince = new Date(user.createdAt || user._id.getTimestamp());
    const now = new Date();

    const monthsTraining = Math.floor(
      (now.getFullYear() - memberSince.getFullYear()) * 12 +
      (now.getMonth() - memberSince.getMonth())
    );

    const memberSinceLabel = memberSince.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }); // e.g. "March 2025"

    return { memberSince, monthsTraining, memberSinceLabel };
  } catch (error) {
    console.error("Error in getAccountSummary:", error);
    const now = new Date();
    return { 
      memberSince: now, 
      monthsTraining: 0, 
      memberSinceLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    };
  }
}
