/**
 * Auth guard for the admin dashboard.
 *
 * - /admin/login and /api/admin/auth/* are public.
 * - Unauthenticated /admin/* pages  → redirect to /admin/login.
 * - Unauthenticated /api/admin/*    → 401 JSON.
 * - Authenticated visitors of /admin/login → sent back to /admin.
 * - Also stamps x-pathname so the admin layout can render the login
 *   page without the dashboard shell chrome.
 */
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/admin/auth/");

  if (isAuthApi) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return withPathname(NextResponse.next(), pathname);
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized — please sign in." },
        { status: 401 },
      );
    }
    const login = new URL("/admin/login", req.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return withPathname(NextResponse.next(), pathname);
}

/** Attach the pathname header (consumed by the admin layout). */
function withPathname(res: NextResponse, pathname: string) {
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
