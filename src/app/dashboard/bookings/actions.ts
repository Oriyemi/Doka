"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendBookingCancelledEmail } from "@/lib/email";
import type { BookingSummary } from "@/emails/components/BookingDetails";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAIRA = new Intl.NumberFormat("en-NG");
const whenFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const durationLabel = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

// Not exported on purpose: every export from a "use server" file is a public
// endpoint. A failed email is logged and never undoes the cancellation.
async function notifyProvider(bookingId: string) {
  try {
    const { rows } = await db.query<{
      reference: string;
      start_at: Date;
      price_naira: number;
      service_name: string;
      duration_min: number;
      store_name: string;
      customer_name: string;
      provider_email: string;
    }>(
      `SELECT b.reference, b.start_at, b.price_naira,
              s.name AS service_name, s.duration_min, st.name AS store_name,
              cu.name AS customer_name, pu.email AS provider_email
       FROM booking b
       JOIN service s ON s.id = b.service_id
       JOIN store st ON st.id = b.store_id
       JOIN "user" cu ON cu.id = b.customer_id
       JOIN "user" pu ON pu.id = st.owner_id
       WHERE b.id = $1`,
      [bookingId],
    );
    const r = rows[0];
    if (!r) return;

    const booking: BookingSummary = {
      serviceName: r.service_name,
      providerName: r.store_name,
      customerName: r.customer_name,
      when: whenFmt.format(r.start_at),
      duration: durationLabel(r.duration_min),
      price: `NGN ${NAIRA.format(r.price_naira)}`,
      reference: r.reference,
    };
    await sendBookingCancelledEmail(r.provider_email, { booking, recipient: "provider" });
  } catch (e) {
    console.error("Booking cancelled email failed:", e);
  }
}

export async function cancelBooking(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  // Only this customer's own booking, only while it is pending or accepted,
  // and only before it starts. A cancelled booking frees its time slot because
  // your database rule only blocks pending and accepted bookings.
  const result = await db.query(
    `UPDATE booking SET status = 'cancelled'
     WHERE id = $1 AND customer_id = $2
       AND status IN ('pending','accepted') AND start_at > now()`,
    [id, session.user.id],
  );

  // rowCount is 0 on a double click or an already-cancelled booking,
  // so the provider is only emailed once.
  if (result.rowCount) {
    after(() => notifyProvider(id));
  }

  revalidatePath("/dashboard/bookings");
}