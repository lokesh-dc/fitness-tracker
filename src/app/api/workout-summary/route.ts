import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db-utils";
import { generateWorkoutSummary } from "@/lib/ai";
import { Exercise, PRHit } from "@/types/workout";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      logId,
      exercises,
      splitName,
      durationSeconds,
      prsHit,
      bodyWeight,
    } = body as {
      logId?: string;
      exercises: Exercise[];
      splitName?: string;
      durationSeconds?: number;
      prsHit?: PRHit[];
      bodyWeight?: number;
    };

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises provided" },
        { status: 400 },
      );
    }

    // Idempotency: if a summary already exists for this log, return it
    // without calling the AI provider again (protects free-tier quota).
    if (logId) {
      const db = await getDb();
      const existing = await db.collection("WorkoutLog").findOne(
        { _id: new ObjectId(logId) },
        { projection: { aiSummary: 1 } },
      );
      if (existing?.aiSummary) {
        return NextResponse.json({ summary: existing.aiSummary });
      }
    }

    const summary = await generateWorkoutSummary({
      splitName,
      exercises,
      durationSeconds,
      prsHit: prsHit || [],
      bodyWeight,
    });

    if (summary && logId) {
      const db = await getDb();
      await db
        .collection("WorkoutLog")
        .updateOne(
          { _id: new ObjectId(logId) },
          { $set: { aiSummary: summary, updatedAt: new Date() } },
        );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating workout summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
