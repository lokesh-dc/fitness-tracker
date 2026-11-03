/**
 * AUDIT SUMMARY - ONBOARDING: GUIDED FIRST SESSION
 * 1. Existing /onboarding flow: Found in src/app/onboarding/OnboardingFlow.tsx. 5-step wizard ending in handleFinish() which redirects to legacy /plan/new. Updated to route to /onboarding/first-session.
 * 2. AI Program Generator: Found in src/lib/ai/program-generator.ts and action generateProgram in src/app/actions/plan.ts. Output is GeneratedProgramResult. Wired into PlanDesigner preview via matchGeneratedExercises.
 * 3. Plan Designer: Found in src/components/PlanDesigner.tsx. Does not persist AI generation until user clicks Save Plan (calls savePlanTemplates).
 * 4. LIVE_SESSION start paths: /workout?mode=LIVE_SESSION calls getPlanByDate. RestTimerBar and WarmupSetsPanel only display/activate in LIVE_SESSION mode.
 * 5. Celebration & Heatmap: WorkoutCelebration in src/components/WorkoutCelebration.tsx; MuscleRecoveryDashCard and MuscleRecoveryMap in src/components/analytics/MuscleRecoveryMap.tsx powered by getMuscleRecovery().
 * 6. User Model: MongoDBAdapter users collection. onboardingSkippedAt?: Date is stored on users document.
 * 7. Demo mode (?demo=true): Handled via src/proxy.ts and /api/auth/demo-login logging in as demo@fittrack.app (DEMO_USER_ID). Checked via isDemoUser to remain permanently INERT.
 */

"use server";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db-utils";
import { isDemoSession, isDemoUser } from "@/lib/demo";
import { OnboardingState } from "@/types/onboarding";
import { revalidatePath } from "next/cache";

export async function getOnboardingState(overrideUserId?: string): Promise<OnboardingState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { status: "INERT" };
    }

    if (isDemoSession(session)) {
      return { status: "INERT" };
    }

    const userId = overrideUserId || (session.user as { id?: string }).id;
    if (!userId || isDemoUser(userId)) {
      return { status: "INERT" };
    }

    const db = await getDb();

    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
    const userQuery = userObjectId ? { $or: [{ userId }, { userId: userObjectId }] } : { userId };

    const [existingLog, userDoc] = await Promise.all([
      db.collection("WorkoutLog").findOne(userQuery, { projection: { _id: 1 } }),
      userObjectId
        ? db.collection("users").findOne({ _id: userObjectId }, { projection: { onboardingSkippedAt: 1 } })
        : null,
    ]);

    if (existingLog) {
      return { status: "INERT" };
    }

    if (userDoc?.onboardingSkippedAt) {
      return { status: "SKIPPED" };
    }

    return { status: "FIRST_RUN" };
  } catch (error) {
    console.error("Error evaluating onboarding state:", error);
    // On unexpected error, fail safe to INERT to avoid blocking regular user flow
    return { status: "INERT" };
  }
}

export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as { id?: string }).id;
    if (!userId || !ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user session" };
    }

    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          onboardingSkippedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/dashboard");
    revalidatePath("/onboarding/first-session");
    return { success: true };
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return { success: false, error: "Failed to skip onboarding" };
  }
}

export async function clearOnboardingSkip(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as { id?: string }).id;
    if (!userId || !ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user session" };
    }

    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $unset: { onboardingSkippedAt: "" },
        $set: { updatedAt: new Date() },
      }
    );

    revalidatePath("/dashboard");
    revalidatePath("/onboarding/first-session");
    return { success: true };
  } catch (error) {
    console.error("Error clearing onboarding skip state:", error);
    return { success: false, error: "Failed to resume onboarding" };
  }
}

