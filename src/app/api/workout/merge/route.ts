import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateMergedWorkout } from "@/lib/ai";
import { getMergeOpportunity, saveMergedTemplate, getExistingMergedWorkout } from "@/app/actions/merge";
import { Exercise } from "@/types/workout";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Re-check merge opportunity server-side to prevent stale/double merges
    const opportunity = await getMergeOpportunity();
    if (!opportunity.canMerge) {
      return NextResponse.json(
        { error: "No merge opportunity available", reason: opportunity.reason },
        { status: 400 },
      );
    }

    // If a merged workout already exists for today, return it instead of re-calling AI
    const existingId = await getExistingMergedWorkout();
    if (existingId) {
      return NextResponse.json({ mergedId: existingId, cached: true });
    }

    const result = await generateMergedWorkout({
      yesterdayTemplate: opportunity.yesterdayTemplate!,
      todayTemplate: opportunity.todayTemplate!,
    });

    if (!result) {
      return NextResponse.json(
        { error: "AI merge failed. Please try doing today's workout normally." },
        { status: 500 },
      );
    }

    // Convert AI output to Exercise[]
    const exercises: Exercise[] = result.exercises.map((ex, idx) => ({
      exerciseId: `merged-${idx}-${Date.now()}`,
      name: ex.name,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      unit: (ex.unit as Exercise["unit"]) || "reps",
      lastWeight: ex.lastWeight,
      pr: 0,
      prReps: 0,
      restDuration: 90,
      sets: Array.from({ length: ex.targetSets }).map(() => ({
        weight: ex.lastWeight,
        reps: ex.targetReps,
        completed: false,
      })),
      isDone: false,
    }));

    const splitName = `${opportunity.yesterdaySplitName} + ${opportunity.todaySplitName}`;

    // Save merged template to DB
    const mergedId = await saveMergedTemplate(
      exercises,
      splitName,
      result.explanation,
      result.estimatedMinutes,
    );

    if (!mergedId) {
      return NextResponse.json(
        { error: "Failed to save merged workout" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mergedId,
      splitName,
      explanation: result.explanation,
      estimatedMinutes: result.estimatedMinutes,
      exerciseCount: exercises.length,
    });
  } catch (error) {
    console.error("Error in merge endpoint:", error);
    return NextResponse.json(
      { error: "Failed to merge workouts" },
      { status: 500 },
    );
  }
}
