import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import NavbarView, { type NavUser } from "./NavbarView";

// A provider is simply a user who owns a store.
async function NavbarData() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
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
    <Suspense fallback={<NavbarView user={undefined} />}>
      <NavbarData />
    </Suspense>
  );
}