"use server";

import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { sendVerificationEmail } from "@/lib/mail";

export async function updateTelegramChatId(chatId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const client = await clientPromise;
  const db = client.db();

  await db.collection("users").updateOne(
    { _id: new ObjectId((session.user as any).id) },
    { $set: { telegramChatId: chatId } }
  );

  revalidatePath("/profile");
  return { success: true };
}

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
