"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";

export type State = { error?: string };

export async function addService(fd: FormData): Promise<State> {
  const store = await getProviderStore();

  const name = String(fd.get("name") ?? "").trim();
  const price = Number(fd.get("price"));
  const duration = Number(fd.get("duration"));
  const depositRaw = String(fd.get("deposit") ?? "").trim();
  const deposit = depositRaw === "" ? null : Number(depositRaw);
  const delivery = String(fd.get("delivery"));

  if (!name || name.length > 80) return { error: "Enter a service name." };
  if (!Number.isInteger(price) || price <= 0) {
    return { error: "Enter a price in naira." };
  }
  if (!Number.isInteger(duration) || duration < 15 || duration > 720) {
    return { error: "Duration must be between 15 and 720 minutes." };
  }
  if (
    deposit !== null &&
    (!Number.isInteger(deposit) || deposit < 0 || deposit > price)
  ) {
    return { error: "Deposit can't be more than the price." };
  }
  if (!["in_store", "home", "both"].includes(delivery)) {
    return { error: "Choose how you offer it." };
  }

  await db.query(
    `INSERT INTO service (store_id, name, price_naira, duration_min, deposit_naira, delivery_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [store.id, name, price, duration, deposit, delivery],
  );
  revalidatePath("/provider/dashboard/services");
  return {};
}

// Hidden, not deleted: old bookings still point to the service
export async function removeService(fd: FormData) {
  const store = await getProviderStore();
  await db.query(
    "UPDATE service SET active = false WHERE id = $1 AND store_id = $2",
    [String(fd.get("id") ?? ""), store.id],
  );
  revalidatePath("/provider/dashboard/services");
}