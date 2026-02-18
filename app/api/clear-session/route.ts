import { NextResponse } from "next/server";

/**
 * GET /api/clear-session
 * Clears all auth cookies server-side. Useful for debugging stale cookie issues.
 * Visit this URL in the browser to reset your session state.
 */
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
  );

  // Expire all auth-related cookies
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });

  return response;
}
