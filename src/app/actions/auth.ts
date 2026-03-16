"use server";

import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    throw new Error("Missing fields.");
  }

  const client = await clientPromise;
  const db = client.db();

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    throw new Error("User already exists.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  await db.collection("users").insertOne({
    email,
    password: hashedPassword,
    name,
    emailVerified: false,
    verificationToken,
    createdAt: new Date(),
  });

  // Try to send email, but don't block the whole registration if it fails (can retry later)
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  return { success: true };
}
