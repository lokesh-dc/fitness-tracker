"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CustomWorkoutPlan {
  id: string;
  userId: string;
  date: string;
  exerciseNames: string[];
  createdAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUserId = (session: any) => (session.user as any).id;

export async function saveCustomWorkoutPlan(
  exerciseNames: string[],
  date?: string,
): Promise<CustomWorkoutPlan> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = getUserId(session);

  const today = date || new Date().toISOString().split("T")[0];
  const db = await getDb();
  const collection = db.collection("CustomWorkoutPlans");

  const existing = await collection.findOne({ userId, date: today });
  const doc = {
    userId,
    date: today,
    exerciseNames,
    createdAt: new Date(),
  };

  if (existing) {
    await collection.updateOne(
      { _id: existing._id },
      { $set: { exerciseNames, createdAt: new Date() } },
    );
  } else {
    await collection.insertOne(doc);
  }

  revalidatePath("/workout");
  revalidatePath(`/workout?date=${today}`);

  const result = existing
    ? { ...doc, id: existing._id.toString() }
    : { ...doc, id: "" };

  return result;
}

export async function getCustomWorkoutPlan(
  date?: string,
): Promise<CustomWorkoutPlan | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = getUserId(session);

  const today = date || new Date().toISOString().split("T")[0];
  const db = await getDb();
  const collection = db.collection("CustomWorkoutPlans");

  const plan = await collection.findOne({ userId, date: today });
  if (!plan) return null;

  return {
    id: plan._id.toString(),
    userId: plan.userId,
    date: plan.date,
    exerciseNames: plan.exerciseNames,
    createdAt: plan.createdAt,
  };
}

export async function deleteCustomWorkoutPlan(date?: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = getUserId(session);

  const today = date || new Date().toISOString().split("T")[0];
  const db = await getDb();
  const collection = db.collection("CustomWorkoutPlans");

  await collection.deleteOne({ userId, date: today });

  revalidatePath("/workout");
  revalidatePath(`/workout?date=${today}`);
}
