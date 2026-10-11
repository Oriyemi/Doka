import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Runs before every request that matches `config.matcher` at the bottom of
// this file. It sends signed-out visitors to /sign-in before a protected page
// starts loading.
//
// This is a fast first check, NOT the security boundary. It only looks at
// whether the session cookie exists. It does not ask the database whether that
// session is real or still valid, for two reasons:
//   - the proxy also runs every time Next prefetches a link, so a database
//     query here would run many times per page view;
//   - the Next.js docs say to keep the proxy to cookie-only checks.
// Anyone can send a made-up cookie with the right name and get past this file.
//
// So every protected page, server action and API route must still confirm the
// session itself before it reads or changes private data:
//
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) redirect("/sign-in");
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// The protected areas. Add a line to protect another one.
// "/dashboard/:path*" means /dashboard and every page under it.
// Everything not listed here stays public: the home page, /services,
// /book, /confirmation, /sign-in, /sign-up and /api/auth.
export const config = {
  matcher: ["/dashboard/:path*", "/provider/:path*", "/onboarding/:path*"],
};