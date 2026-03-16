import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define public paths that shouldn't be redirected
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const isPublicApi = pathname.startsWith("/api/auth");

  // If user is logged in and trying to access auth pages (login/signup), redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is NOT logged in and trying to access protected pages, redirect to login
  // Excluding landing page, auth pages, public APIs, and static files
  const isProtectedPath = !isAuthPage && !isLandingPage && !isPublicApi && 
                          !pathname.includes(".") && // simple check for static files
                          !pathname.startsWith("/_next");

  if (!token && isProtectedPath) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
