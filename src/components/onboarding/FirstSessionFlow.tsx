"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FirstSessionGoalProfile } from "@/types/onboarding";
import { UserProfile } from "@/types/profile";
import { ExerciseReview, MatchedDay, SplitStyle } from "@/types/workout";
import { GoalProfileStep } from "./GoalProfileStep";
import { GeneratingPlanState } from "./GeneratingPlanState";
import { PlanDesigner } from "@/components/PlanDesigner";
import { generateProgram, matchGeneratedExercises } from "@/app/actions/plan";
import { skipOnboarding } from "@/app/actions/onboarding";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, ArrowLeft, RefreshCw, X } from "lucide-react";

interface FirstSessionFlowProps {
  initialProfile: Partial<UserProfile> | null;
  allExercises: any[];
}

type FlowPhase = "profile" | "generating" | "preview";

function getSplitForDays(daysPerWeek: number): { splitStyle: SplitStyle; trainingDays: number[] } {
  switch (daysPerWeek) {
    case 2:
      return { splitStyle: "upper-lower", trainingDays: [1, 4] };
    case 4:
      return { splitStyle: "upper-lower", trainingDays: [1, 2, 4, 5] };
    case 5:
      return { splitStyle: "ppl-upper-lower", trainingDays: [1, 2, 3, 4, 5] };
    case 6:
      return { splitStyle: "ppl", trainingDays: [1, 2, 3, 4, 5, 6] };
    case 3:
    default:
      return { splitStyle: "full-body", trainingDays: [1, 3, 5] };
  }
}

function makeTempId(dayOfWeek: number, aiName: string): string {
  const slug = aiName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
  return `temp-${dayOfWeek}-${slug}`;
}

export function FirstSessionFlow({
  initialProfile,
  allExercises,
}: FirstSessionFlowProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<FlowPhase>("profile");
  const [goalProfile, setGoalProfile] = useState<FirstSessionGoalProfile>({
    goal: "hypertrophy",
    experienceLevel: "beginner",
    daysPerWeek: initialProfile?.preferredTrainingDays?.length
      ? Math.min(6, Math.max(2, initialProfile.preferredTrainingDays.length))
      : 3,
    equipment: ["barbell", "dumbbell", "cables", "machines", "bodyweight"],
  });

  const [isSkipping, setIsSkipping] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [matchedDays, setMatchedDays] = useState<MatchedDay[]>([]);
  const [previewDirty, setPreviewDirty] = useState(false);

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await skipOnboarding();
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  const startEmptySession = () => {
    router.push("/workout?mode=LIVE_SESSION&tour=true");
  };

  const runProgramGeneration = async (profileToUse: FirstSessionGoalProfile) => {
    setPhase("generating");
    setGenerationError(null);

    const { splitStyle, trainingDays } = getSplitForDays(profileToUse.daysPerWeek);

    try {
      const result = await generateProgram({
        goal: profileToUse.goal,
        daysPerWeek: profileToUse.daysPerWeek,
        trainingDays,
        splitStyle,
        equipment: profileToUse.equipment,
        experienceLevel: profileToUse.experienceLevel,
        weeksCount: 4,
        sessionMinutes: 60,
      });

      if (!result.success) {
        setGenerationError(result.error || "AI could not generate routine");
        return;
      }

      const matched = await matchGeneratedExercises(result.program.days);
      if (!matched || matched.length === 0) {
        setGenerationError("Could not match exercises from the library. Please try again or start with an open session.");
        return;
      }

      setMatchedDays(matched);
      setPreviewDirty(false);
      setPhase("preview");
    } catch (err) {
      console.error("First session generation error:", err);
      setGenerationError("An unexpected error occurred while generating your plan.");
    }
  };

  const handleProfileSubmit = (profile: FirstSessionGoalProfile) => {
    setGoalProfile(profile);
    runProgramGeneration(profile);
  };

  // Build PlanDesigner inputs from matched days
  const planData = React.useMemo(() => {
    if (matchedDays.length === 0) return null;

    const templates = [];
    for (let d = 0; d < 7; d++) {
      const matched = matchedDays.find((m) => m.dayOfWeek === d);
      if (!matched) {
        templates.push({
          id: `preview-${d}`,
          userId: "",
          planId: "",
          weekNumber: 1,
          dayOfWeek: d,
          splitName: "Rest Day",
          exercises: [],
        });
        continue;
      }

      templates.push({
        id: `preview-${d}`,
        userId: "",
        planId: "",
        weekNumber: 1,
        dayOfWeek: d,
        splitName: matched.name,
        exercises: matched.exercises.map((ex) => ({
          exerciseId: ex.exerciseId || makeTempId(d, ex.aiName),
          name: ex.exerciseName || ex.aiName,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          unit: "reps" as const,
          restDuration: ex.restDuration,
          lastWeight: ex.lastWeight || 0,
          pr: 0,
          prReps: 0,
          sets: [],
        })),
      });
    }

    const { splitStyle } = getSplitForDays(goalProfile.daysPerWeek);
    const plan = {
      id: "",
      userId: "",
      name: `Starter AI Routine · ${goalProfile.daysPerWeek} Days`,
      startDate: new Date().toISOString().split("T")[0],
      numWeeks: 4,
      createdAt: new Date(),
      mobilityWarmupIds: [],
      customMobilityWarmups: [],
    };

    return {
      plan,
      templates,
    };
  }, [matchedDays, goalProfile.daysPerWeek]);

  const exerciseReviews = React.useMemo(() => {
    const reviews: Record<string, ExerciseReview> = {};
    for (const day of matchedDays) {
      for (const ex of day.exercises) {
        if (ex.exerciseId) continue;
        const tempId = makeTempId(day.dayOfWeek, ex.aiName);
        if (ex.needsUserReview) {
          reviews[tempId] = {
            kind: "review",
            candidates: ex.reviewCandidates || [],
            aiName: ex.aiName,
            muscleGroup: ex.muscleGroup,
          };
        } else if (ex.isNew) {
          reviews[tempId] = {
            kind: "new",
            aiName: ex.aiName,
            muscleGroup: ex.muscleGroup,
          };
        }
      }
    }
    return reviews;
  }, [matchedDays]);

  const dayRationales = React.useMemo(() => {
    const rationales: Record<number, string> = {};
    for (const day of matchedDays) {
      if (day.rationale) rationales[day.dayOfWeek] = day.rationale;
    }
    return rationales;
  }, [matchedDays]);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-primary" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
              Guided First Session
            </p>
            <h1 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">
              {phase === "profile"
                ? "Design Your Starter Program"
                : phase === "generating"
                  ? "Crafting Your Routine"
                  : "Review & Confirm Plan"}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isSkipping}
          className="text-xs font-black uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors flex items-center gap-1 min-h-[44px] px-3">
          <X className="w-4 h-4" />
          Skip for now
        </button>
      </div>

      {/* Main Flow Content */}
      {phase === "profile" && (
        <GoalProfileStep
          initialProfile={goalProfile}
          onSubmit={handleProfileSubmit}
          onSkip={handleSkip}
          isSubmitting={isSkipping}
        />
      )}

      {phase === "generating" && (
        <GeneratingPlanState
          error={generationError}
          onRetry={() => runProgramGeneration(goalProfile)}
          onStartEmptySession={startEmptySession}
          onBackToProfile={() => setPhase("profile")}
        />
      )}

      {phase === "preview" && planData && (
        <div className="space-y-6">
          <GlassCard className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-brand-primary/20">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                Step 2 of 2 · Editable Preview
              </p>
              <h2 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight">
                Review your program before locking it in
              </h2>
              <p className="text-xs text-foreground/50 font-medium">
                Make any changes below. Saving will immediately launch Day 1 in Guided Live Session.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhase("profile")}
                className="glass-button px-3.5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-foreground/60">
                <ArrowLeft className="w-3.5 h-3.5" />
                Edit Goals
              </button>
              <button
                type="button"
                onClick={() => runProgramGeneration(goalProfile)}
                className="glass-button px-3.5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-foreground/60">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </GlassCard>

          <PlanDesigner
            initialData={planData}
            initialExercises={allExercises}
            initialStep="exercises"
            dayRationales={dayRationales}
            exerciseReviews={exerciseReviews}
            onDirtyStateChange={setPreviewDirty}
            onSavedRedirectUrl="/workout?mode=LIVE_SESSION&tour=true"
          />
        </div>
      )}
    </div>
  );
}
