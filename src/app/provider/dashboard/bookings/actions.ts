"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import { sendBookingConfirmedEmail, sendBookingDeclinedEmail } from "@/lib/email";
import { whatsappLink } from "@/lib/whatsapp";
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
// endpoint. A failed email is logged and never undoes a saved decision.
async function notifyCustomer(bookingId: string, outcome: "accepted" | "declined") {
  try {
    const { rows } = await db.query<{
      reference: string;
      start_at: Date;
      price_naira: number;
      deposit_naira: number | null;
      deposit_paid: boolean;
      service_name: string;
      duration_min: number;
      store_name: string;
      whatsapp_number: string | null;
      customer_name: string;
      customer_email: string;
    }>(
      `SELECT b.reference, b.start_at, b.price_naira, b.deposit_naira, b.deposit_paid,
              s.name AS service_name, s.duration_min,
              st.name AS store_name, st.whatsapp_number,
              cu.name AS customer_name, cu.email AS customer_email
       FROM booking b
       JOIN service s ON s.id = b.service_id
       JOIN store st ON st.id = b.store_id
       JOIN "user" cu ON cu.id = b.customer_id
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

    if (outcome === "accepted") {
      // Only when there is a deposit and it has not been paid yet
      const deposit =
        r.deposit_naira && !r.deposit_paid
          ? {
              amount: `NGN ${NAIRA.format(r.deposit_naira)}`,
              whatsappUrl: r.whatsapp_number
                ? whatsappLink(
                    r.whatsapp_number,
                    `Hi, I'm ${r.customer_name}. I booked ${r.service_name} on ${booking.when} (Ref ${r.reference}). How can I pay the ₦${NAIRA.format(r.deposit_naira)} deposit?`,
                  )
                : undefined,
            }
          : undefined;
      await sendBookingConfirmedEmail(r.customer_email, { booking, deposit });
    } else {
      await sendBookingDeclinedEmail(r.customer_email, { booking });
    }
  } catch (e) {
    console.error("Booking response email failed:", e);
  }
}

export async function respond(formData: FormData) {
  const store = await getProviderStore();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("decision") === "accept" ? "accepted" : "declined";
  if (!UUID.test(id)) return;

  // Only this provider's own pending bookings can be changed
  const result = await db.query(
    "UPDATE booking SET status = $1 WHERE id = $2 AND store_id = $3 AND status = 'pending'",
    [status, id, store.id],
  );

  // rowCount is 0 on a double click or a booking that was already answered,
  // so the customer is only emailed once.
  if (result.rowCount) {
    after(() => notifyCustomer(id, status));
  }

  revalidatePath("/provider/dashboard/bookings");
}

export async function markDepositPaid(formData: FormData) {
  const store = await getProviderStore();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  // Only this provider's own accepted booking, and only while the deposit is
  // still unpaid, so a double click does nothing the second time.
  await db.query(
    `UPDATE booking SET deposit_paid = true
     WHERE id = $1 AND store_id = $2 AND status = 'accepted'
       AND deposit_naira > 0 AND deposit_paid = false`,
    [id, store.id],
  );

  revalidatePath("/provider/dashboard/bookings");
  revalidatePath("/dashboard/bookings");
}