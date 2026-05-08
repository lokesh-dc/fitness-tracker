"use server";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db-utils";
import { UserProfile } from "@/types/profile";
import { revalidatePath } from "next/cache";

export async function saveOnboardingStep(data: Partial<UserProfile>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const db = await getDb();

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If it's a new profile, we need to set createdAt
    await db.collection("user_profiles").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: updateData,
        $setOnInsert: {
          userId: new ObjectId(userId),
          onboardingComplete: false,
          bannerDismissed: false,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    revalidatePath("/onboarding");
    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding step:", error);
    return { success: false, error: "Failed to save data" };
  }
}

export async function getOnboardingProfile(): Promise<UserProfile | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const userId = (session.user as any).id;
    const db = await getDb();

    const profile = await db.collection("user_profiles").findOne({
      userId: new ObjectId(userId)
    });

    if (!profile) return null;

    // Convert MongoDB document to plain object for Client Component
    return JSON.parse(JSON.stringify(profile)) as UserProfile;
  } catch (error) {
    console.error("Error getting onboarding profile:", error);
    return null;
  }
}

export async function dismissOnboardingBanner() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const db = await getDb();

    await db.collection("user_profiles").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          bannerDismissed: true,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: new ObjectId(userId),
          onboardingComplete: false,
          createdAt: new Date()
        }
      },
      { upsert: true }

    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error dismissing onboarding banner:", error);
    return { success: false };
  }
}

