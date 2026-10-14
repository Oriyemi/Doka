"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function completeOnboarding(choice: "provider" | "customer") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  if (choice !== "provider" && choice !== "customer") {
    throw new Error("Invalid choice");
  }

  await db.query(
    'update "user" set "onboarded" = true, "role" = $1 where id = $2',
    [choice, session.user.id],
  );

  redirect(choice === "provider" ? "/provider/setup" : "/explore");
}