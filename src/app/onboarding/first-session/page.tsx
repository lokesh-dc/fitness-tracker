import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOnboardingState } from "@/app/actions/onboarding";
import { getOnboardingProfile } from "@/app/actions/profile";
import { getExercises } from "@/app/actions/exercises";
import { getActivePlanInfo, getPlanByDate } from "@/app/actions/plan";
import { getDb } from "@/lib/db-utils";
import { ObjectId } from "mongodb";
import { FirstSessionFlow } from "@/components/onboarding/FirstSessionFlow";
import { Header } from "@/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FitTrack | Guided First Session",
  description: "Set up your starter routine and start your first live workout",
};

export const dynamic = "force-dynamic";

export default async function FirstSessionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as { id?: string }).id;
  const onboardingState = await getOnboardingState(userId);

  // Existing users with logs or demo users should never be on onboarding
  if (onboardingState.status === "INERT") {
    redirect("/dashboard");
  }

  // If user already has an active plan but zero logs:
  // skip generation step and go straight to guided session
  const activePlan = await getActivePlanInfo();
  if (activePlan && !activePlan.isCompleted) {
    const todayPlan = await getPlanByDate();
    if (todayPlan && todayPlan.exercises && todayPlan.exercises.length > 0) {
      redirect("/workout?mode=LIVE_SESSION&tour=true");
    }

    // Today is a rest day: find first workout day with exercises
    if (userId && ObjectId.isValid(userId)) {
      const db = await getDb();
      const firstWorkoutTemplate = await db.collection("WorkoutTemplate").findOne(
        {
          planId: activePlan.id,
          $or: [{ userId: new ObjectId(userId) }, { userId }],
          "exercises.0": { $exists: true },
        },
        { sort: { dayOfWeek: 1 } }
      );

      if (firstWorkoutTemplate) {
        // Find next date matching this dayOfWeek
        const targetDayOfWeek = firstWorkoutTemplate.dayOfWeek;
        const targetDate = new Date();
        const currentDayOfWeek = targetDate.getDay();
        const diffDays = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
        targetDate.setDate(targetDate.getDate() + diffDays);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        redirect(`/workout?mode=LIVE_SESSION&tour=true&date=${targetDateStr}`);
      }
    }

    redirect("/workout?mode=LIVE_SESSION&tour=true");
  }

  const [userProfile, exercises] = await Promise.all([
    getOnboardingProfile().catch(() => null),
    getExercises().catch(() => []),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        title="Guided First Session"
        subtitle="AI-tailored routine & coach-guided workout"
      />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-36">
        <FirstSessionFlow
          initialProfile={userProfile}
          allExercises={exercises}
        />
      </main>
    </div>
  );
}

