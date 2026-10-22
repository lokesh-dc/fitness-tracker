"use server";

import { getDb } from "@/lib/db-utils";
import { bestEpleyFromSets, calculateEpley } from "@/lib/epley";
import { detectPlateau } from "@/lib/plateau";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ExerciseHistorySession = {
  date: string; // formatted as "MMM DD" e.g. "Apr 22"
  totalSets: number;
  topSetReps: number; // max reps performed at the heaviest weight
  topSetWeight: number; // heaviest set weight
  estimated1RM: number; // Epley 1RM for the top set shown on this row
  sets: { weight: number; reps: number }[]; // all sets for expanded view
};

export type ExerciseHistoryResult = {
  sessions: ExerciseHistorySession[];
  plateauDetected: boolean;
};

export async function getExerciseHistory(
  exerciseName: string
): Promise<ExerciseHistoryResult> {
  if (!exerciseName) {
    return { sessions: [], plateauDetected: false };
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      return { sessions: [], plateauDetected: false };
    }

    const db = await getDb();
    const userObjectId = new ObjectId(userId);

    const pipeline = [
      { $match: { userId: userObjectId, "exercises.name": exerciseName } },
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
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ];

    const results = await db.collection("WorkoutLog").aggregate(pipeline).toArray();

    if (results.length === 0) {
      return { sessions: [], plateauDetected: false };
    }

    const sessions: (ExerciseHistorySession & {
      rawDate: Date | string;
      best1RM: number;
    })[] = results.map((doc) => {
      const sets = doc.sets as { weight: number; reps: number }[];
      const maxWeight = doc.maxWeight as number;

      // Find the best set at the heaviest weight (max reps on ties).
      const topSet = sets.reduce((prev, current) => {
        if (current.weight > prev.weight) return current;
        if (current.weight === prev.weight && current.reps > prev.reps) return current;
        return prev;
      });

      // Keep the displayed 1RM tied to the top set shown on the row, but use
      // the best set of the whole session for plateau detection.
      const estimated1RM = calculateEpley(maxWeight, topSet.reps) ?? maxWeight;
      const best1RM = bestEpleyFromSets(sets)?.estimated1RM ?? estimated1RM;

      return {
        date: format(new Date(doc._id), "MMM dd"),
        rawDate: doc._id,
        totalSets: sets.length,
        topSetReps: topSet.reps,
        topSetWeight: maxWeight,
        estimated1RM,
        best1RM,
        sets,
      };
    });

    const plateauDetected = detectPlateau(
      sessions.map((session) => ({
        date: session.rawDate,
        maxWeight: session.topSetWeight,
        estimated1RM: session.best1RM,
      })),
    );

    return {
      sessions: sessions.map((session) => ({
        date: session.date,
        totalSets: session.totalSets,
        topSetReps: session.topSetReps,
        topSetWeight: session.topSetWeight,
        estimated1RM: session.estimated1RM,
        sets: session.sets,
      })),
      plateauDetected,
    };
  } catch (error) {
    console.error("Error fetching exercise history:", error);
    return { sessions: [], plateauDetected: false };
  }
}
