import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Everyone who already has an account lands on Explore. Providers reach their
// dashboard from the navbar, and clients reach their bookings the same way.
const HOME = "/explore";

// Cookie check first (cheap), then the real session to read onboarded.
// NOT the security boundary: every page and server action still checks the
// real session itself.
export async function proxy(request: NextRequest) {
  // Server Action requests carry a "next-action" header. Let them through:
  // a redirect here returns HTML to the action, and the client throws
  // "An unexpected response was received from the server."
  // Each action checks the session itself (uploadId does).
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("redirect", pathname);

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(signIn);
  }

  let session;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (e) {
    // The database could not be reached. Do not turn a network hiccup into an
    // error page: the page itself checks the session again.
    console.error("proxy: session check failed:", e);
    return NextResponse.next();
  }
  if (!session) {
    return NextResponse.redirect(signIn);
  }

  const { onboarded } = session.user;
  const onOnboarding =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  // First time: everything goes to onboarding
  if (!onboarded && !onOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Already onboarded: skip onboarding, go to Explore
  if (onboarded && onOnboarding) {
    return NextResponse.redirect(new URL(HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/store-setup/:path*",
    "/provider/:path*",
  ],
};