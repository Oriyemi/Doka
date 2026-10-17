import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function ProviderDashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const { rows } = await db.query(
    "SELECT * FROM store WHERE owner_id = $1",
    [session.user.id],
  );

  const store = rows[0];

  if (!store) redirect("/provider/set-up");

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{store.name}</h1>

      <p>
        {store.service} · {store.location}
      </p>

      <p>doka.app/{store.slug}</p>

      <p>Status: {store.verification_status}</p>
    </main>
  );
}

export default function ProviderDashboard() {
  return (
    <Suspense
      fallback={<p className="p-8">Loading dashboard...</p>}
    >
      <ProviderDashboardContent />
    </Suspense>
  );
}