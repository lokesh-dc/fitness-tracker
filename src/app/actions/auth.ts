"use server";

import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

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

  await db.collection("users").insertOne({
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
  });

  return { success: true };
}
