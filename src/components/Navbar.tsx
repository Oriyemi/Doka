import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import NavbarView, { type NavUser } from "./NavbarView";

// Shown while the real navbar loads. It must not use any hooks (usePathname
// and friends): a fallback renders outside the Suspense boundary, and on
// pages with a changing address part that fails the build.
function NavbarSkeleton() {
  return (
    <nav className="sticky top-0 z-40 bg-[#701E47] text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <span className="text-2xl font-extrabold">
          Doka<span className="text-[#8C2B5C]/60">.</span>
        </span>
      </div>
    </nav>
  );
}

// A provider is simply a user who owns a store.
async function NavbarData() {
  // Read the request headers OUTSIDE try/catch. While building, Next stops this
  // render by rejecting headers(), and catching that rejection breaks the build.
  const requestHeaders = await headers();

  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return <NavbarView user={null} />;

    const { rows } = await db.query(
      `SELECT 1 FROM store WHERE owner_id = $1 LIMIT 1`,
      [session.user.id],
    );
    const user: NavUser = { name: session.user.name, isProvider: rows.length > 0 };
    return <NavbarView user={user} />;
  } catch (e) {
    // A database hiccup must never take down the whole page.
    console.error("Navbar session check failed:", e);
    return <NavbarView user={undefined} />;
  }
}

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarData />
    </Suspense>
  );
}