"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";

export async function respond(formData: FormData) {
  const store = await getProviderStore();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("decision") === "accept" ? "accepted" : "declined";

  // Only this provider's own pending bookings can be changed
  await db.query(
    "UPDATE booking SET status = $1 WHERE id = $2 AND store_id = $3 AND status = 'pending'",
    [status, id, store.id],
  );
  revalidatePath("/provider/dashboard/bookings");
}