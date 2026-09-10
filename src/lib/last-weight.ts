import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { MatchedDay } from "@/types/workout";

interface RawWorkoutLog {
  exercises?: {
    exerciseId?: string;
    sets?: { weight?: number }[];
  }[];
}

export async function attachLastWeights(
  userId: string,
  days: MatchedDay[],
): Promise<MatchedDay[]> {
  const targetIds = new Set(
    days
      .flatMap((d) => d.exercises)
      .map((ex) => ex.exerciseId)
      .filter((id): id is string => Boolean(id)),
  );
  if (targetIds.size === 0) return days;

  let objectUserId: ObjectId;
  try {
    objectUserId = new ObjectId(userId);
  } catch {
    return days;
  }

  try {
    const db = await getDb();
    const logs = (await db
      .collection("WorkoutLog")
      .find({
        userId: objectUserId,
        "exercises.exerciseId": { $in: [...targetIds] },
      })
      .project({ date: 1, createdAt: 1, exercises: 1 })
      .sort({ date: -1, createdAt: -1 })
      .limit(150)
      .toArray()) as unknown as RawWorkoutLog[];

    const lastWeightById = new Map<string, number>();

    for (const log of logs) {
      for (const ex of log.exercises || []) {
        if (!ex.exerciseId || !targetIds.has(ex.exerciseId)) continue;
        if (lastWeightById.has(ex.exerciseId)) continue;
        const weights = (ex.sets || [])
          .map((s) => Number(s.weight))
          .filter((w) => Number.isFinite(w) && w > 0);
        if (weights.length > 0) {
          lastWeightById.set(ex.exerciseId, Math.max(...weights));
        }
      }
    }

    if (lastWeightById.size === 0) return days;

    return days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => {
        if (!ex.exerciseId) return ex;
        const lastWeight = lastWeightById.get(ex.exerciseId);
        if (lastWeight === undefined) return ex;
        return { ...ex, lastWeight };
      }),
    }));
  } catch (error) {
    console.error("Error attaching last weights:", error);
    return days;
  }
}