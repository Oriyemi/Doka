"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFreeSlots } from "@/lib/slots"; // same import as the page
import { sendBookingRequestReceivedEmail, sendNewBookingRequestEmail } from "@/lib/email";
import type { BookingSummary } from "@/emails/components/BookingDetails";

export type BookingState = {
  error?: string;
  values?: { name: string; phone: string; place: string; address: string; note: string };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAIRA = new Intl.NumberFormat("en-NG");
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" });
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
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const durationLabel = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

export async function createBooking(
  _prev: BookingState,
  fd: FormData,
): Promise<BookingState> {
  const values = {
    name: text(fd, "name"),
    phone: text(fd, "phone"),
    place: text(fd, "place"),
    address: text(fd, "address"),
    note: text(fd, "note"),
  };
  const fail = (error: string): BookingState => ({ error, values });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return fail("Please sign in again to book.");

  // Never trust ids or times from the browser: look everything up again.
  const serviceId = text(fd, "serviceId");
  const slot = text(fd, "slot");
  if (!UUID.test(serviceId)) return fail("This service could not be found.");

  const { rows } = await db.query<{
    id: string;
    store_id: string;
    owner_id: string;
    owner_email: string;
    service_name: string;
    store_name: string;
    duration_min: number;
    price_naira: number;
    deposit_naira: number | null;
    delivery_type: string;
    verification_status: string;
  }>(
    `SELECT s.id, s.store_id, st.owner_id, u.email AS owner_email,
            s.name AS service_name, st.name AS store_name,
            s.duration_min, s.price_naira, s.deposit_naira,
            s.delivery_type, st.verification_status
     FROM service s
     JOIN store st ON st.id = s.store_id
     JOIN "user" u ON u.id = st.owner_id
     WHERE s.id = $1 AND s.active`,
    [serviceId],
  );
  const service = rows[0];
  if (!service || service.verification_status !== "verified") {
    return fail("This service is not available for booking.");
  }
  if (service.owner_id === session.user.id) {
    return fail("You can't book your own service.");
  }

  // The chosen time must still be free right now.
  const start = new Date(slot);
  if (Number.isNaN(start.getTime())) return fail("Please choose a time.");
  const free = await getFreeSlots(
    service.store_id,
    dayKeyFmt.format(start),
    service.duration_min,
  );
  if (!free.includes(start.toISOString())) {
    return fail("That time was just taken. Please choose another.");
  }

  // Details
  if (values.name.length < 2 || values.name.length > 80) {
    return fail("Enter your full name.");
  }
  const phone = values.phone.replace(/[\s\-()]/g, "");
  if (!/^(\+234|0)\d{10}$/.test(phone)) {
    return fail("Enter a valid Nigerian phone number, like 08012345678.");
  }
  if (values.note.length > 300) return fail("Keep your note under 300 characters.");

  // Where the service happens is decided by the service, not the browser.
  const place =
    service.delivery_type === "home"
      ? "home"
      : service.delivery_type === "in_store"
        ? "store"
        : values.place === "home"
          ? "home"
          : "store";
  if (place === "home" && values.address.length < 8) {
    return fail("Enter the address where the provider should come.");
  }

  // Save the booking. Price and deposit come from the service row we just
  // loaded, never from the form.
  const end = new Date(start.getTime() + service.duration_min * 60_000);

  let reference: string;
  try {
    const { rows: saved } = await db.query<{ reference: string }>(
      `INSERT INTO booking
         (store_id, service_id, customer_id, start_at, end_at,
          customer_phone, customer_note, address, price_naira, deposit_naira)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING reference`,
      [
        service.store_id,
        service.id,
        session.user.id,
        start,
        end,
        phone,
        values.note || null,
        place === "home" ? values.address : null,
        service.price_naira,
        service.deposit_naira,
      ],
    );
    reference = saved[0].reference;
  } catch (e) {
    // 23P01 = the database refused an overlapping booking (your EXCLUDE rule)
    if ((e as { code?: string }).code === "23P01") {
      return fail("That time was just taken. Please choose another.");
    }
    console.error("createBooking insert failed:", e);
    return fail("Something went wrong saving your booking. Please try again.");
  }

  // Emails. after() runs once the response is sent, so the customer isn't
  // kept waiting, and a failed email is logged instead of undoing a booking
  // that is already saved.
  const booking: BookingSummary = {
    serviceName: service.service_name,
    providerName: service.store_name,
    customerName: values.name,
    when: whenFmt.format(start),
    duration: durationLabel(service.duration_min),
    price: `NGN ${NAIRA.format(service.price_naira)}`,
    reference,
  };
  const customerEmail = session.user.email;
  const providerEmail = service.owner_email;

  after(async () => {
    const results = await Promise.allSettled([
      sendBookingRequestReceivedEmail(customerEmail, { booking }),
      sendNewBookingRequestEmail(providerEmail, { booking }),
    ]);
    for (const r of results) {
      if (r.status === "rejected") console.error("Booking email failed:", r.reason);
    }
  });

  // redirect() works by throwing, so it stays outside the try/catch above
  redirect(`/book/thanks/${reference}`);
}