import "server-only";
import { db } from "@/lib/db";
import { getFreeSlots } from "@/lib/slots";

export async function createBooking(input: {
  storeId: string;
  serviceId: string;
  customerId: string;
  startAt: string; // ISO string picked from getFreeSlots
}): Promise<{ ok?: true; error?: string }> {
  const { rows } = await db.query(
    "SELECT duration_min FROM service WHERE id = $1 AND store_id = $2 AND active",
    [input.serviceId, input.storeId],
  );
  if (!rows[0]) return { error: "That service isn't available." };

  const duration: number = rows[0].duration_min;
  const start = new Date(input.startAt);
  const end = new Date(start.getTime() + duration * 60_000);

  // Layer 1: the time must be one of the free slots for that day (Nigerian date)
  const date = new Date(start.getTime() + 3_600_000).toISOString().slice(0, 10);
  const free = await getFreeSlots(input.storeId, date, duration);
  if (!free.includes(start.toISOString())) {
    return { error: "That time isn't available." };
  }

  // Layer 2: the database refuses overlaps even if two people click together
  try {
    await db.query(
      `INSERT INTO booking (store_id, service_id, customer_id, start_at, end_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.storeId, input.serviceId, input.customerId, start, end],
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23P01") {
      return { error: "Someone just booked that time. Please pick another." };
    }
    throw e;
  }
  return { ok: true };
}