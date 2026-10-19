"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";

export async function saveAvailability(fd: FormData) {
  const store = await getProviderStore();

  const days: { d: number; s: string; e: string }[] = [];
  for (let d = 0; d < 7; d++) {
    if (fd.get(`on_${d}`) !== "on") continue;
    const s = String(fd.get(`start_${d}`));
    const e = String(fd.get(`end_${d}`));
    if (/^\d{2}:\d{2}$/.test(s) && /^\d{2}:\d{2}$/.test(e) && e > s) {
      days.push({ d, s, e });
    }
  }

  // Replace the whole week in one go, all or nothing
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM availability WHERE store_id = $1", [
      store.id,
    ]);
    for (const x of days) {
      await client.query(
        "INSERT INTO availability (store_id, weekday, start_time, end_time) VALUES ($1, $2, $3, $4)",
        [store.id, x.d, x.s, x.e],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  redirect("/provider/dashboard/availability?saved=1");
}