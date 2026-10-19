"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function completeOnboarding(
  choice: "provider" | "customer",
  rawName: string,
): Promise<{ error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Onboarding runs once. Without this, anyone signed in could call the
  // action again and change their role.
  if (session.user.onboarded) {
    redirect(session.user.role === "provider" ? "/provider/dashboard" : "/explore");
  }

  if (choice !== "provider" && choice !== "customer") {
    return { error: "Choose how you'll use Doka." };
  }

  const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) {
    return { error: "Enter your full name (2 to 60 characters)." };
  }

  await db.query(
    'update "user" set "onboarded" = true, "role" = $1, "name" = $2 where id = $3 and "onboarded" = false',
    [choice, name, session.user.id],
  );

  redirect(choice === "provider" ? "/provider/set-up" : "/explore");
}