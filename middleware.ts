import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ONLY these routes require authentication — everything else is public
const protectedRoutes = [
  "/dashboard",
  "/billing",
  "/assessment",
  "/assessments",
  "/patient-info",
  "/payment",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /login, /register, /, /api/* — always public, never redirected
  // Only check if this is a protected route
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) {
    // Not a protected route — let it through unconditionally
    return NextResponse.next();
  }

  // It IS a protected route — check for session cookie
  const sessionCookie = request.cookies.get("session")?.value;
  const isAuthenticated = sessionCookie === "active";

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on routes that could be protected — skip static assets
  matcher: [
    "/dashboard/:path*",
    "/billing/:path*",
    "/assessment/:path*",
    "/assessments/:path*",
    "/patient-info/:path*",
    "/payment/:path*",
  ],
};
