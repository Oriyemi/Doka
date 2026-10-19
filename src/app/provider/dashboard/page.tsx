import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import Spinner from "@/components/spinner";
import PageHeader from "./page-header";
import Stars from "./overview";
import StoreCard from "./store-card";
import { card, cardTitle, display } from "./ui";

type Counts = { pending: number; upcoming: number; completed_month: number };
type Rating = { avg: string | null; total: number };
type Next = { id: string; customer: string; service: string; start_at: Date };
type Latest = {
  id: string;
  rating: number;
  comment: string | null;
  customer: string;
};

const TZ = "Africa/Lagos";
const dayFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  timeZone: TZ,
});
const monFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: TZ,
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "short",
  timeZone: TZ,
});

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

function Stat({
  label,
  value,
  note,
  href,
  highlight,
}: {
  label: string;
  value: string | number;
  note?: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-3xl p-4 ring-1 transition hover:-translate-y-0.5 sm:p-6 ${
        highlight
          ? "bg-[#6F1D44] text-white ring-[#6F1D44] shadow-[0_16px_40px_-18px_rgba(111,29,68,0.7)]"
          : "bg-white text-[#2B0F20] ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06),0_16px_40px_-20px_rgba(111,29,68,0.28)]"
      }`}
    >
      <p
        className={`text-xs font-medium sm:text-sm ${
          highlight ? "text-white/80" : "text-[#6B4A5C]"
        }`}
      >
        {label}
      </p>
      <p
        className={`${display} mt-3 text-4xl font-semibold tracking-tight sm:text-5xl`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${
          highlight ? "text-white/70" : "text-[#6B4A5C]"
        }`}
      >
        {note ?? "\u00A0"}
      </p>
    </Link>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-[#8E2B5C] underline underline-offset-4"
    >
      See all
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

export default function OverviewPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Overview"
        subtitle="Here's what's happening at your store."
      />

      <Suspense
        fallback={<Spinner fullScreen={false} label="Loading overview..." />}
      >
        <OverviewContent />
      </Suspense>
    </div>
  );
}

async function OverviewContent() {
  const store = await getProviderStore();

  const [counts, rating, next, latest] = await Promise.all([
    db.query<Counts>(
      `SELECT
         count(*) FILTER (WHERE status = 'pending')::int AS pending,
         count(*) FILTER (WHERE status = 'accepted' AND end_at > now())::int AS upcoming,
         count(*) FILTER (
           WHERE (status = 'completed' OR (status = 'accepted' AND end_at <= now()))
             AND start_at >= date_trunc('month', now())
         )::int AS completed_month
       FROM booking WHERE store_id = $1`,
      [store.id],
    ),
    db.query<Rating>(
      `SELECT round(avg(rating)::numeric, 1)::text AS avg, count(*)::int AS total
       FROM review WHERE store_id = $1`,
      [store.id],
    ),
    db.query<Next>(
      `SELECT b.id, b.start_at, u.name AS customer, s.name AS service
       FROM booking b
       JOIN service s ON s.id = b.service_id
       JOIN "user" u ON u.id = b.customer_id
       WHERE b.store_id = $1 AND b.status = 'accepted' AND b.end_at > now()
       ORDER BY b.start_at LIMIT 5`,
      [store.id],
    ),
    db.query<Latest>(
      `SELECT r.id, r.rating, r.comment, u.name AS customer
       FROM review r JOIN "user" u ON u.id = r.customer_id
       WHERE r.store_id = $1 ORDER BY r.created_at DESC LIMIT 3`,
      [store.id],
    ),
  ]);

  const c = counts.rows[0];
  const r = rating.rows[0];
  const verified = store.verification_status === "verified";

  return (
    <div className="space-y-6 sm:space-y-8">
      {!verified && (
        <div className="flex flex-col gap-3 rounded-3xl bg-[#FFF6E3] p-5 ring-1 ring-[#F2DDA8] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm leading-relaxed text-[#6B4A00]">
            <ShieldAlert
              size={20}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            Your store isn&apos;t verified yet, so it won&apos;t show on
            Explore.
          </p>
          <Link
            href="/provider/verify"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-[#6B4A00] px-5 text-sm font-semibold text-white transition hover:bg-[#553b00]"
          >
            Get verified
          </Link>
        </div>
      )}

      <StoreCard store={store} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat
          label="Pending requests"
          value={c.pending}
          note={c.pending > 0 ? "Needs your reply" : "All caught up"}
          href="/provider/dashboard/bookings?tab=incoming"
          highlight={c.pending > 0}
        />
        <Stat
          label="Upcoming bookings"
          value={c.upcoming}
          href="/provider/dashboard/bookings?tab=upcoming"
        />
        <Stat
          label="Completed this month"
          value={c.completed_month}
          href="/provider/dashboard/bookings?tab=previous"
        />
        <Stat
          label="Rating"
          value={r.avg ?? "–"}
          note={`${r.total} review${r.total === 1 ? "" : "s"}`}
          href="/provider/dashboard/reviews"
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="flex items-center justify-between gap-4">
            <h2 className={cardTitle}>Next bookings</h2>
            <SeeAll href="/provider/dashboard/bookings?tab=upcoming" />
          </div>

          {next.rows.length === 0 ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FBF3F8] p-5 text-sm text-[#6B4A5C]">
              <CalendarDays
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p>
                No upcoming bookings yet. Share your store link to get your
                first one.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {next.rows.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-4 rounded-2xl bg-[#FBF3F8] p-3 sm:p-4"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-[#6F1D44] ring-1 ring-[#EBD3E0]">
                    <span
                      className={`${display} text-xl font-semibold leading-none`}
                    >
                      {dayFmt.format(b.start_at)}
                    </span>
                    <span className="mt-0.5 text-[11px] font-semibold">
                      {monFmt.format(b.start_at)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#2B0F20]">
                      {b.customer}
                    </p>
                    <p className="truncate text-sm text-[#6B4A5C]">
                      {b.service} · {timeFmt.format(b.start_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <div className="flex items-center justify-between gap-4">
            <h2 className={cardTitle}>Latest reviews</h2>
            <SeeAll href="/provider/dashboard/reviews" />
          </div>

          {latest.rows.length === 0 ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FBF3F8] p-5 text-sm text-[#6B4A5C]">
              <MessageSquare
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p>Reviews appear here after clients complete a booking.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {latest.rows.map((x) => (
                <li key={x.id} className="rounded-2xl bg-[#FBF3F8] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6F1D44] text-xs font-bold text-white">
                      {initialsOf(x.customer)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#2B0F20]">
                        {x.customer}
                      </p>
                      <Stars value={x.rating} />
                    </div>
                  </div>
                  {x.comment && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#4A3340]">
                      {x.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}