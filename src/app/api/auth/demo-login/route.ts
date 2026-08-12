import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { DEMO_EMAIL } from "@/lib/demo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: DEMO_EMAIL });

    if (!user) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    const token = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      emailVerified: (user as any).emailVerified || null,
    };

    const secret = process.env.NEXTAUTH_SECRET || "development_secret_only_for_dev_mode";
    
    const jwt = await encode({
      token,
      secret,
    });

    const isSecure = process.env.NODE_ENV === "production" || request.url.startsWith("https://");
    const cookieName = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    const maxAge = 30 * 24 * 60 * 60;

    response.cookies.set(cookieName, jwt, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;

  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
