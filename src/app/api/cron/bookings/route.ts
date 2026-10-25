import { db } from "@/lib/db";
import {
  sendBookingDeclinedEmail,
  sendBookingPendingReminderEmail,
  sendBookingReminderEmail,
} from "@/lib/email";
import type { BookingSummary } from "@/emails/components/BookingDetails";

// Change these to change the rules.
const NUDGE_AFTER_MIN = 60; // remind the provider after 1 hour
const EXPIRE_AFTER_HOURS = 24; // decline requests nobody answered
const REMIND_WITHIN_HOURS = 24; // remind the customer this far ahead

const NAIRA = new Intl.NumberFormat("en-NG");
const TZ = "Africa/Lagos";
const whenFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
const durationLabel = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

// Loads everything an email needs for one booking.
async function load(id: string) {
  const { rows } = await db.query<{
    reference: string;
    start_at: Date;
    created_at: Date;
    price_naira: number;
    service_name: string;
    duration_min: number;
    store_name: string;
    customer_name: string;
    customer_email: string;
    provider_email: string;
  }>(
    `SELECT b.reference, b.start_at, b.created_at, b.price_naira,
            s.name AS service_name, s.duration_min, st.name AS store_name,
            cu.name AS customer_name, cu.email AS customer_email,
            pu.email AS provider_email
     FROM booking b
     JOIN service s ON s.id = b.service_id
     JOIN store st ON st.id = b.store_id
     JOIN "user" cu ON cu.id = b.customer_id
     JOIN "user" pu ON pu.id = st.owner_id
     WHERE b.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  const booking: BookingSummary = {
    serviceName: r.service_name,
    providerName: r.store_name,
    customerName: r.customer_name,
    when: whenFmt.format(r.start_at),
    duration: durationLabel(r.duration_min),
    price: `NGN ${NAIRA.format(r.price_naira)}`,
    reference: r.reference,
  };
  return {
    booking,
    start: r.start_at,
    created: r.created_at,
    customerEmail: r.customer_email,
    providerEmail: r.provider_email,
  };
}

function waitedFor(created: Date) {
  const mins = Math.round((Date.now() - created.getTime()) / 60_000);
  return mins < 90 ? "1 hour" : `${Math.round(mins / 60)} hours`;
}

export async function GET(request: Request) {
  // Only the scheduler may call this. Without the secret it does nothing.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const out = { expired: 0, nudged: 0, reminded: 0, failed: 0 };

  // 1. Expire unanswered requests (frees their time slot)
  const { rows: expired } = await db.query<{ id: string }>(
    `UPDATE booking SET status = 'declined'
     WHERE status = 'pending'
       AND (created_at < now() - $1::int * interval '1 hour' OR start_at <= now())
     RETURNING id`,
    [EXPIRE_AFTER_HOURS],
  );
  for (const { id } of expired) {
    try {
      const d = await load(id);
      if (!d) continue;
      await sendBookingDeclinedEmail(d.customerEmail, {
        booking: d.booking,
        reason: "The provider did not respond in time.",
      });
      out.expired++;
    } catch (e) {
      console.error("Expiry email failed:", id, e);
      out.failed++;
    }
  }

  // 2. Nudge providers about requests still waiting (once per booking)
  const { rows: nudge } = await db.query<{ id: string }>(
    `UPDATE booking SET pending_reminder_sent_at = now()
     WHERE status = 'pending' AND pending_reminder_sent_at IS NULL
       AND start_at > now()
       AND created_at < now() - $1::int * interval '1 minute'
     RETURNING id`,
    [NUDGE_AFTER_MIN],
  );
  for (const { id } of nudge) {
    try {
      const d = await load(id);
      if (!d) continue;
      await sendBookingPendingReminderEmail(d.providerEmail, {
        booking: d.booking,
        waitingFor: waitedFor(d.created),
      });
      out.nudged++;
    } catch (e) {
      console.error("Pending reminder failed:", id, e);
      out.failed++;
    }
  }

  // 3. Remind customers about confirmed bookings coming up (once per booking)
  const { rows: remind } = await db.query<{ id: string }>(
    `UPDATE booking SET reminder_sent_at = now()
     WHERE status = 'accepted' AND reminder_sent_at IS NULL
       AND start_at > now()
       AND start_at <= now() + $1::int * interval '1 hour'
     RETURNING id`,
    [REMIND_WITHIN_HOURS],
  );
  for (const { id } of remind) {
    try {
      const d = await load(id);
      if (!d) continue;
      const sameDay = dayKeyFmt.format(d.start) === dayKeyFmt.format(new Date());
      await sendBookingReminderEmail(d.customerEmail, {
        booking: d.booking,
        startsIn: sameDay ? "today" : "tomorrow",
      });
      out.reminded++;
    } catch (e) {
      console.error("Booking reminder failed:", id, e);
      out.failed++;
    }
  }

  return Response.json(out);
}