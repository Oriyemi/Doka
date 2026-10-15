"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function completeOnboarding(choice: "provider" | "customer") {
  // The function the role picker calls with either "provider" or "customer".
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // : is the choice valid? did hey choose provider or customer 
  if (choice !== "provider" && choice !== "customer") {
    throw new Error("Invalid choice");
  }

  // save it on database 
  await db.query(
    'update "user" set "onboarded" = true, "role" = $1 where id = $2',
    [choice, session.user.id],
  );

  // if provider is true setup your store page , if not if it a customer go to explore to view the stores or the main dashboard 
  redirect(choice === "provider" ? "/provider/setup" : "/explore");
}

// This is the server action that runs when someone clicks Continue on the onboarding page. It saves their choice and sends them to the right place.