// what this page does: provider submits the form (business name, link, location, services etc), it checks the user (must be signed in and have chosen the provider role), validates the form, saves to PostgreSQL (inserts the store into the database), then redirects to /provider/verify to verify with an ID card.

"use server"; // server actions: they run on the server and talk to the db

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RESERVED_SLUGS } from "@/lib/provider";

export type StoreFormState = { error?: string };

export async function createStore(
  _prev: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  // 1. Who is this? The user id comes from the session, never from the form.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/onboarding");

  // 2. Read and validate
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const location = String(formData.get("location") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const deliveryType = String(formData.get("deliveryType") ?? "");

  if (name.length < 2 || name.length > 60)
    return { error: "Enter your business name (2 to 60 characters)." };

  // regex: lowercase a-z, numbers 0-9, single hyphens between words
  if (
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ||
    slug.length < 3 ||
    slug.length > 40
  )
    return { error: "Store link: 3 to 40 letters, numbers or single hyphens." };

  // Links that would clash with real pages, since stores live at /<slug>
  if (RESERVED_SLUGS.has(slug))
    return { error: "That store link is not available. Try another." };

  if (location.length < 2) return { error: "Enter your city and area." };
  if (service.length < 2) return { error: "Enter the service you render." };
  if (!["in_store", "home", "both"].includes(deliveryType))
    return { error: "Choose where you serve clients." };

  // 3. Save. INSERT adds a new row to the store table; $1..$6 are placeholders.
  try {
    await db.query(
      `INSERT INTO store (owner_id, slug, name, location, service, delivery_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [session.user.id, slug, name, location, service, deliveryType],
    );
  } catch (e: any) {
    if (e.code === "23505") {
      // 23505 = unique violation. Check which unique index was hit.
      return {
        error: String(e.constraint ?? "").includes("slug")
          ? "That store link is already taken. Try another."
          : "You already have a store.",
      };
    }
    console.error("[createStore]", e);
    return { error: "Something went wrong. Try again." };
  }

  // 4. Next step (redirect must stay outside try/catch)
  redirect("/provider/verify");
}