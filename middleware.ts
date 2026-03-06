import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match AUTH_COOKIE in services/base.ts
const AUTH_COOKIE = "access_token";

// Routes that are always public (no token required)
const PUBLIC_PATHS = ["/login", "/signup", "/", "/api/auth"];

// Routes that only make sense when NOT authenticated
const AUTH_ONLY_PATHS = ["/login", "/signup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the token.  encodeURIComponent() was used when setting, so decode.
  const raw = request.cookies.get(AUTH_COOKIE)?.value ?? "";
  const token = raw ? decodeURIComponent(raw) : null;

  const isAuthenticated = Boolean(token);

  // ── 1. Unauthenticated user hitting a protected route ──────────────────────
  if (!isPublic(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Authenticated user hitting login / signup ───────────────────────────
  if (isAuthOnly(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 3. Everything else — let through ──────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  /*
   * Run on every route EXCEPT:
   *   - Next.js internals (_next/static, _next/image)
   *   - All static files with an extension (favicon.ico, robots.txt, etc.)
   *   - /api routes that handle their own auth (optional — remove if you want
   *     middleware to guard API routes too)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
