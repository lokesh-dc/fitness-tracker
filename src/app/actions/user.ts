"use server";

import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { sendVerificationEmail } from "@/lib/mail";

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
