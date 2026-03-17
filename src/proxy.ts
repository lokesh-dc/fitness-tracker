import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";

  if (token && (isAuthPage || isLandingPage)) {
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
    "/",
    "/auth/:path*",
    "/dashboard/:path*",
    "/plan/:path*",
    "/profile/:path*",
    "/workout/:path*",
  ],
};
