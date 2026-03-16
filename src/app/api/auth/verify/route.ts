import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin?error=MissingToken", req.url));
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin?error=InvalidToken", req.url));
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { emailVerified: true },
        $unset: { verificationToken: "" }
      }
    );

    return NextResponse.redirect(new URL("/auth/signin?verified=true", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=VerificationFailed", req.url));
  }
}
