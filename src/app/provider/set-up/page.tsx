import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import StoreForm from "./store-form";

export default async function SetUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (!session.user.onboarded) redirect("/onboarding");
  if (session.user.role !== "provider") redirect("/explore");

  // Already has a store? Don't show the form again.
  const { rows } = await db.query("SELECT 1 FROM store WHERE owner_id = $1", [
    session.user.id,
  ]);
  if (rows.length > 0) redirect("/provider/dashboard");

  return <StoreForm />;
}