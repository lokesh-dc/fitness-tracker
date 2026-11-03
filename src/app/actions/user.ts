"use server";

import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { sendVerificationEmail } from "@/lib/mail";
import { UserSettings, DEFAULT_USER_SETTINGS } from "@/types/user-settings";

export async function resendVerification() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({
    _id: new ObjectId((session.user as any).id),
  });

  if (!user || user.emailVerified) {
    return { success: false, message: "Already verified or user not found." };
  }

  // Reuse existing token or generate a new one
  const token = user.verificationToken;

  await sendVerificationEmail(user.email, token);

  return { success: true };
}

export async function updateProfile(data: {
  name: string;
  email: string;
  gender?: string;
  weight?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const client = await clientPromise;
  const db = client.db();
  const userId = new ObjectId((session.user as any).id);

  // Check if email is already taken by another user
  if (data.email !== session.user.email) {
    const existingUser = await db.collection("users").findOne({ 
      email: data.email,
      _id: { $ne: userId }
    });
    if (existingUser) {
      return { success: false, message: "Email already taken." };
    }
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    gender: data.gender,
    weight: data.weight,
    updatedAt: new Date()
  };

  // If email changed, reset verification
  if (data.email !== session.user.email) {
    updateData.emailVerified = false;
    updateData.verificationToken = require('crypto').randomBytes(32).toString('hex');
    await sendVerificationEmail(data.email, updateData.verificationToken);
  }

  await db.collection("users").updateOne(
    { _id: userId },
    { $set: updateData }
  );

  revalidatePath("/profile");
  return { success: true, emailChanged: data.email !== session.user.email };
}

export async function getUserSettings(overrideUserId?: string): Promise<UserSettings> {
  let userIdStr = overrideUserId;
  if (!userIdStr) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return DEFAULT_USER_SETTINGS;
    userIdStr = (session.user as any).id;
  }

  const client = await clientPromise;
  const db = client.db();
  const userId = new ObjectId(userIdStr);

  const user = await db.collection("users").findOne({ _id: userId });
  return {
    defaultRestDuration: user?.defaultRestDuration ?? DEFAULT_USER_SETTINGS.defaultRestDuration,
    logWeightBeforeWorkout: user?.logWeightBeforeWorkout ?? DEFAULT_USER_SETTINGS.logWeightBeforeWorkout,
  };
}

export async function updateUserSettings(patch: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const userIdStr = (session.user as any).id;
    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(userIdStr);

    const updateFields: any = { updatedAt: new Date() };
    if (typeof patch.logWeightBeforeWorkout === "boolean") {
      updateFields.logWeightBeforeWorkout = patch.logWeightBeforeWorkout;
    }
    if (
      typeof patch.defaultRestDuration === "number" &&
      patch.defaultRestDuration >= 15 &&
      patch.defaultRestDuration <= 600
    ) {
      updateFields.defaultRestDuration = Math.round(patch.defaultRestDuration);
    }

    await db.collection("users").updateOne(
      { _id: userId },
      { $set: updateFields }
    );

    revalidatePath("/profile");
    revalidatePath("/workout");
    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
