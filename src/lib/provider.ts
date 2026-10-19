import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type Store = {
  id: string;
  name: string;
  slug: string;
  location: string;
  delivery_type: "in_store" | "home" | "both";
  verification_status: string | null;
};

export const DELIVERY_LABEL = {
  in_store: "In store",
  home: "Home service",
  both: "Both",
} as const;

// Formats a date as Nigerian time, e.g. "20 Oct 2026, 10:00"
export const fmt = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(d);

export async function getProviderStore(): Promise<Store> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { rows } = await db.query("SELECT * FROM store WHERE owner_id = $1", [
    session.user.id,
  ]);
  if (!rows[0]) redirect("/provider/set-up");

  return rows[0] as Store;
}