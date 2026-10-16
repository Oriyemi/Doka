import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

function roleHome(role?: string | null) {
  return role === "provider" ? "/provider" : "/set-up";
}

// Cookie check first (cheap), then the real session to read onboarded and role.
// NOT the security boundary: every page and server action still checks the
// real session itself.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("redirect", pathname);

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(signIn);
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(signIn);
  }

  const { onboarded, role } = session.user;
  const onOnboarding =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  // First time: everything goes to onboarding
  if (!onboarded && !onOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Already onboarded: skip onboarding, go to their own home
  if (onboarded && onOnboarding) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/bookings/:path*",
    "/profile/:path*",
    "/store-setup/:path*",
    "/provider/:path*",
  ],
};