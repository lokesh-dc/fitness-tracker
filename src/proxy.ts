import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl;
  const isDemoRequest = searchParams.get("demo") === "true";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "development_secret_only_for_dev_mode"
  });

  // Handle Demo Mode Entry
  if (isDemoRequest) {
    // If already logged in as demo user, strip the param and stay on page
    if (token?.email === "demo@fittrack.app") {
      const url = req.nextUrl.clone();
      url.searchParams.delete("demo");
      return NextResponse.redirect(url);
    }

    // Redirect to demo login flow
    const callbackUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    const finalCallback = callbackUrl.replace(/[?&]demo=true/, "");

    return NextResponse.redirect(
      new URL(`/api/auth/demo-login?callbackUrl=${encodeURIComponent(finalCallback)}`, req.url)
    );
  }

  // Handle Authentication Guards
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const isDemoSession = token?.email === "demo@fittrack.app";

  // Redirect logged-in NON-DEMO users away from auth/landing pages
  if (token && (isAuthPage || isLandingPage) && !isDemoSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }


  const isPrivatePage = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/workout");

  if (!token && isPrivatePage) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

