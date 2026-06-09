import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better-Auth sets "better-auth.session_token" on HTTP (dev) and
  // "__Secure-better-auth.session_token" on HTTPS (prod).
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // ── Already on login ────────────────────────────────────────────────────────
  // Never redirect away from /login here — the page itself handles the
  // "already logged in → go to /" case via the auth client on the client side.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // ── Protect every other matched route ────────────────────────────────────────
  if (!sessionToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the original URL so we can redirect back after login
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (handled above without redirect risk)
     * - /api/auth/** (Better-Auth endpoints — must stay public)
     * - /api/portfolio (public endpoint consumed by the Astro landing)
     * - _next/static, _next/image, favicon and public assets
     */
    "/((?!login|api/auth|api/portfolio|api/leads|_next/static|_next/image|favicon\\.ico|.*\\.svg).*)",
  ],
};
