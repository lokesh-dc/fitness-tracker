"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutTemplate, Exercise } from "@/types/workout";
import { getPlanByDate } from "./plan";
import { getTodayWorkoutLog } from "./logs";
import { subDays, format } from "date-fns";

export interface MergeOpportunity {
  canMerge: boolean;
  yesterdayTemplate: WorkoutTemplate | null;
  todayTemplate: WorkoutTemplate | null;
  yesterdayDate: string;
  yesterdaySplitName: string;
  todaySplitName: string;
  reason?: string;
}

export interface MergedWorkoutDoc {
  _id?: ObjectId;
  userId: ObjectId;
  splitName: string;
  exercises: Exercise[];
  explanation: string;
  estimatedMinutes: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface YesterdayMissedInfo {
  hasMissed: boolean;
  splitName: string;
  exerciseCount: number;
}

/**
 * Lightweight check: was yesterday a planned workout day with no log?
 * Used on dashboard load to decide whether to show the merge button.
 * Does NOT check today's status — that happens on click via getMergeOpportunity.
 */
export async function getYesterdayMissedWorkout(): Promise<YesterdayMissedInfo> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { hasMissed: false, splitName: "", exerciseCount: 0 };

    const now = new Date();
    const yesterday = subDays(now, 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    const yesterdayTemplate = await getPlanByDate(yesterdayStr);

    if (!yesterdayTemplate || !yesterdayTemplate.exercises || yesterdayTemplate.exercises.length === 0) {
      return { hasMissed: false, splitName: "", exerciseCount: 0 };
    }

    const yesterdayLog = await getTodayWorkoutLog(yesterdayStr);
    if (yesterdayLog && yesterdayLog.exercises && yesterdayLog.exercises.length > 0) {
      return { hasMissed: false, splitName: "", exerciseCount: 0 };
    }

    return {
      hasMissed: true,
      splitName: yesterdayTemplate.splitName || "Yesterday's Workout",
      exerciseCount: yesterdayTemplate.exercises.length,
    };
  } catch (error) {
    console.error("Error checking yesterday's workout:", error);
    return { hasMissed: false, splitName: "", exerciseCount: 0 };
  }
}

export async function getMergeOpportunity(): Promise<MergeOpportunity> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        canMerge: false,
        yesterdayTemplate: null,
        todayTemplate: null,
        yesterdayDate: "",
        yesterdaySplitName: "",
        todaySplitName: "",
        reason: "Not authenticated",
      };
    }

    const now = new Date();
    const yesterday = subDays(now, 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");
    const todayStr = format(now, "yyyy-MM-dd");

    // Fetch templates for both days
    const [yesterdayTemplate, todayTemplate] = await Promise.all([
      getPlanByDate(yesterdayStr),
      getPlanByDate(todayStr),
    ]);

    // Check if yesterday's template has exercises
    if (!yesterdayTemplate || !yesterdayTemplate.exercises || yesterdayTemplate.exercises.length === 0) {
      return {
        canMerge: false,
        yesterdayTemplate,
        todayTemplate,
        yesterdayDate: yesterdayStr,
        yesterdaySplitName: yesterdayTemplate?.splitName || "",
        todaySplitName: todayTemplate?.splitName || "",
        reason: "No workout was planned for yesterday",
      };
    }

    // Check if today's template has exercises
    if (!todayTemplate || !todayTemplate.exercises || todayTemplate.exercises.length === 0) {
      return {
        canMerge: false,
        yesterdayTemplate,
        todayTemplate,
        yesterdayDate: yesterdayStr,
        yesterdaySplitName: yesterdayTemplate.splitName || "",
        todaySplitName: "",
        reason: "No workout planned for today",
      };
    }

    // Check if yesterday was already completed
    const yesterdayLog = await getTodayWorkoutLog(yesterdayStr);
    if (yesterdayLog && yesterdayLog.exercises && yesterdayLog.exercises.length > 0) {
      return {
        canMerge: false,
        yesterdayTemplate,
        todayTemplate,
        yesterdayDate: yesterdayStr,
        yesterdaySplitName: yesterdayTemplate.splitName || "",
        todaySplitName: todayTemplate.splitName || "",
        reason: "Yesterday's workout was already completed",
      };
    }

    // Check if today is already completed
    const todayLog = await getTodayWorkoutLog(todayStr);
    if (todayLog && todayLog.exercises && todayLog.exercises.length > 0) {
      return {
        canMerge: false,
        yesterdayTemplate,
        todayTemplate,
        yesterdayDate: yesterdayStr,
        yesterdaySplitName: yesterdayTemplate.splitName || "",
        todaySplitName: todayTemplate.splitName || "",
        reason: "Today's workout is already completed",
      };
    }

    return {
      canMerge: true,
      yesterdayTemplate,
      todayTemplate,
      yesterdayDate: yesterdayStr,
      yesterdaySplitName: yesterdayTemplate.splitName || "Yesterday's Workout",
      todaySplitName: todayTemplate.splitName || "Today's Workout",
    };
  } catch (error) {
    console.error("Error checking merge opportunity:", error);
    return {
      canMerge: false,
      yesterdayTemplate: null,
      todayTemplate: null,
      yesterdayDate: "",
      yesterdaySplitName: "",
      todaySplitName: "",
      reason: "Error checking merge opportunity",
    };
  }
}

export async function saveMergedTemplate(
  exercises: Exercise[],
  splitName: string,
  explanation: string,
  estimatedMinutes: number
): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await db.collection("MergedWorkout").insertOne({
      userId,
      splitName,
      exercises,
      explanation,
      estimatedMinutes,
      createdAt: now,
      expiresAt,
    });

    return result.insertedId.toString();
  } catch (error) {
    console.error("Error saving merged template:", error);
    return null;
  }
}

export async function getMergedTemplate(
  mergedId: string
): Promise<MergedWorkoutDoc | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const doc = await db.collection("MergedWorkout").findOne({
      _id: new ObjectId(mergedId),
      userId,
      expiresAt: { $gt: new Date() },
    });

    if (!doc) return null;

    return {
      _id: doc._id,
      userId: doc.userId,
      splitName: doc.splitName,
      exercises: doc.exercises,
      explanation: doc.explanation,
      estimatedMinutes: doc.estimatedMinutes,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    } as MergedWorkoutDoc;
  } catch (error) {
    console.error("Error fetching merged template:", error);
    return null;
  }
}

export async function cleanupMergedTemplate(mergedId: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    await db.collection("MergedWorkout").deleteOne({
      _id: new ObjectId(mergedId),
      userId,
    });
  } catch (error) {
    console.error("Error cleaning up merged template:", error);
  }
}

/**
 * Check if there's already a non-expired merged workout for today.
 * Returns the existing ID if found, so we skip the AI call.
 */
export async function getExistingMergedWorkout(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await db.collection("MergedWorkout").findOne({
      userId,
      createdAt: { $gte: startOfDay },
      expiresAt: { $gt: now },
    });

    return existing?._id?.toString() || null;
  } catch (error) {
    console.error("Error checking existing merged workout:", error);
    return null;
  }
}
