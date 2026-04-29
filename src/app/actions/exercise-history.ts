"use server";

import { getDb } from "@/lib/db-utils";
import { ObjectId } from "mongodb";
import { format } from "date-fns";

export type ExerciseHistorySession = {
  date: string; // formatted as "MMM DD" e.g. "Apr 22"
  totalSets: number;
  topSetReps: number; // reps on the heaviest set
  topSetWeight: number; // heaviest set weight
  estimated1RM: number; // Epley, server-side
  sets: { weight: number; reps: number }[]; // all sets for expanded view
};

export type ExerciseHistoryResult = {
  sessions: ExerciseHistorySession[];
  plateauDetected: boolean;
};

export async function getExerciseHistory(
  userId: string,
  exerciseName: string
): Promise<ExerciseHistoryResult> {
  if (!userId || !exerciseName) {
    return { sessions: [], plateauDetected: false };
  }

  try {
    const db = await getDb();

    const pipeline = [
      { $match: { userId: new ObjectId(userId), "exercises.name": exerciseName } },
      { $sort: { date: -1 } },
      { $limit: 8 }, // fetch extra to ensure 5 valid sessions after zero-weight filtering
      { $unwind: "$exercises" },
      { $match: { "exercises.name": exerciseName } },
      { $unwind: "$exercises.sets" },
      {
        $match: {
          "exercises.sets.weight": { $gt: 0 },
          "exercises.sets.reps": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$date",
          sets: {
            $push: {
              weight: "$exercises.sets.weight",
              reps: "$exercises.sets.reps",
            },
          },
          maxWeight: { $max: "$exercises.sets.weight" },
          totalVolume: {
            $sum: {
              $multiply: ["$exercises.sets.weight", "$exercises.sets.reps"],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ];

    const results = await db.collection("WorkoutLog").aggregate(pipeline).toArray();

    if (results.length === 0) {
      return { sessions: [], plateauDetected: false };
    }

    const sessionsWithVolume: (ExerciseHistorySession & { totalVolume: number })[] = results.map((doc) => {
      // Find the set with max weight to get its reps
      const topSet = doc.sets.reduce((prev: any, current: any) => {
        return prev.weight > current.weight ? prev : current;
      });

      // Epley 1RM: maxWeight * (1 + reps / 30)
      const estimated1RM = doc.maxWeight * (1 + topSet.reps / 30);

      return {
        date: format(new Date(doc._id), "MMM dd"),
        totalSets: doc.sets.length,
        topSetReps: topSet.reps,
        topSetWeight: doc.maxWeight,
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        sets: doc.sets,
        totalVolume: doc.totalVolume,
      };
    });

    // Plateau detection
    let plateauDetected = false;
    if (sessionsWithVolume.length >= 3) {
      // sessions[0] is most recent
      const s0 = sessionsWithVolume[0].totalVolume;
      const s1 = sessionsWithVolume[1].totalVolume;
      const s2 = sessionsWithVolume[2].totalVolume;

      if (s0 <= s1 && s1 <= s2) {
        plateauDetected = true;
      }
    }

    return {
      sessions: sessionsWithVolume.map(({ totalVolume, ...rest }) => rest),
      plateauDetected,
    };
  } catch (error) {
    console.error("Error fetching exercise history:", error);
    return { sessions: [], plateauDetected: false };
  }
}
