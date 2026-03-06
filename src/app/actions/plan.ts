"use server";

import { ObjectId, WithId, Document } from "mongodb";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { WorkoutTemplate } from "@/types/workout";

export async function getTodayPlan(userId: string): Promise<WorkoutTemplate | null> {
  try {
    const db = await getDb();
    const dayOfWeek = getCurrentDayOfWeek();
    const weekNumber = getCurrentWeekIndex();

    const plan = await db.collection("WorkoutTemplate").findOne({
      userId: new ObjectId(userId),
      weekNumber,
      dayOfWeek,
    }) as (WithId<Document> & Partial<WorkoutTemplate>) | null;

    if (!plan) return null;

    const { _id, ...rest } = plan;

    return JSON.parse(JSON.stringify({
      ...rest,
      id: _id.toString(),
      userId: plan.userId ? plan.userId.toString() : "",
    })) as WorkoutTemplate;
  } catch (error) {
    console.error("Error fetching today's plan:", error);
    return null;
  }
}
