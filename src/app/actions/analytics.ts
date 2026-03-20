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
