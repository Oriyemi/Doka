import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import VerifyForm from "./verify-form";

export default async function VerifyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/onboarding");

  const { rows } = await db.query(
    "SELECT verification_status FROM store WHERE owner_id = $1",
    [session.user.id],
  );
  if (!rows[0]) redirect("/provider/set-up");
  if (rows[0].verification_status === "verified") redirect("/provider/dashboard");

  return <VerifyForm />;
}