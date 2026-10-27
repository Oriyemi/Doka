import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, MessageCircle, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import CancelButton from "./cancel-button";
import StoreAvatar from "@/components/store-avatar";
import Spinner from "@/components/spinner";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { whatsappLink } from "@/lib/whatsapp";

type Search = Promise<{ tab?: string }>;

const NAIRA = new Intl.NumberFormat("en-NG");
const whenFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

// The SQL conditions live in this constant map, never in user input.
const TABS = {
  upcoming: {
    label: "Upcoming",
    where: "b.status = 'accepted' AND b.end_at > now()",
    empty: "You have no confirmed bookings coming up.",
  },
  pending: {
    label: "Pending",
    where: "b.status = 'pending'",
    empty: "No requests are waiting for a provider.",
  },
  past: {
    label: "Past",
    where:
      "(b.status IN ('declined','cancelled','completed') OR (b.status = 'accepted' AND b.end_at <= now()))",
    empty: "Your past bookings will show up here.",
  },
} as const;
type Tab = keyof typeof TABS;
const TAB_ORDER: Tab[] = ["upcoming", "pending", "past"];

type Row = {
  id: string;
  reference: string;
  start_at: Date;
  end_at: Date;
  status: string;
  price_naira: number;
  deposit_naira: number | null;
  deposit_paid: boolean;
  whatsapp_number: string | null;
  address: string | null;
  service_name: string;
  store_name: string;
  slug: string;
  logo_url: string | null;
};

function badge(status: string, ended: boolean) {
  switch (status) {
    case "pending":
      return {
        text: "Waiting for provider",
        cls: "bg-[#FFF4E0] text-[#8A5A00]",
      };
    case "accepted":
      return ended
        ? { text: "Completed", cls: "bg-[#F6E6F0] text-[#6B1F45]" }
        : { text: "Confirmed", cls: "bg-[#E6F4EA] text-[#1E6B3A]" };
    case "declined":
      return { text: "Declined", cls: "bg-[#FDECEC] text-[#9B1C1C]" };
    case "cancelled":
      return { text: "Cancelled", cls: "bg-[#EFEAED] text-[#4A3340]" };
    default:
      return { text: "Completed", cls: "bg-[#F6E6F0] text-[#6B1F45]" };
  }
}

export default function MyBookingsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <Spinner fullScreen={false} label="Loading your bookings..." />
          }
        >
          <Content searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Content({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const tab: Tab = TAB_ORDER.includes(sp.tab as Tab)
    ? (sp.tab as Tab)
    : "upcoming";

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?redirect=/dashboard/bookings");
  const userId = session.user.id;

  const { rows: counts } = await db.query<Record<Tab, number>>(
    `SELECT
       count(*) FILTER (WHERE status = 'pending')::int AS pending,
       count(*) FILTER (WHERE status = 'accepted' AND end_at > now())::int AS upcoming,
       count(*) FILTER (WHERE status IN ('declined','cancelled','completed')
                          OR (status = 'accepted' AND end_at <= now()))::int AS past
     FROM booking WHERE customer_id = $1`,
    [userId],
  );

  const { rows } = await db.query<Row>(
    `SELECT b.id, b.reference, b.start_at, b.end_at, b.status, b.price_naira, b.deposit_naira,
            b.deposit_paid, b.address, s.name AS service_name,
            st.name AS store_name, st.slug, st.logo_url, st.whatsapp_number
     FROM booking b
     JOIN service s ON s.id = b.service_id
     JOIN store st ON st.id = b.store_id
     WHERE b.customer_id = $1 AND ${TABS[tab].where}
     ORDER BY b.start_at ${tab === "past" ? "DESC" : "ASC"}
     LIMIT 50`,
    [userId],
  );

  const now = Date.now();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-[#2B0F20] sm:text-3xl">
        My bookings
      </h1>

      <nav
        aria-label="Booking status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {TAB_ORDER.map((t) => {
          const active = t === tab;
          return (
            <Link
              key={t}
              href={`/dashboard/bookings?tab=${t}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-semibold transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-[#EBD3E0] bg-white text-[#2B0F20] hover:border-primary"
              }`}
            >
              {TABS[t].label}
              <span
                className={`rounded-full px-2 text-xs ${
                  active ? "bg-white/20" : "bg-[#F6E6F0] text-[#6B1F45]"
                }`}
              >
                {counts[0]?.[t] ?? 0}
              </span>
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-[#EBD3E0] bg-white p-8 text-center">
          <p className="text-sm text-[#6B4A5C]">{TABS[tab].empty}</p>
          <Link
            href="/explore"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Find a service
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => {
            const ended = b.end_at.getTime() <= now;
            const status = badge(b.status, ended);
            return (
              <li
                key={b.id}
                className="rounded-2xl border border-[#EBD3E0] bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <StoreAvatar
                    name={b.store_name}
                    logoUrl={b.logo_url}
                    className="h-12 w-12 shrink-0 rounded-xl text-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <h2 className="min-w-0 wrap-break-word font-bold text-[#2B0F20]">
                        {b.service_name}
                      </h2>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <Link
                      href={`/${b.slug}`}
                      className="text-sm text-[#6F1D44] hover:underline"
                    >
                      {b.store_name}
                    </Link>

                    <dl className="mt-3 space-y-1.5 text-sm text-[#4A3340]">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={14}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                        <dt className="sr-only">When</dt>
                        <dd>{whenFmt.format(b.start_at)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet
                          size={14}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                        <dt className="sr-only">Price</dt>
                        <dd>
                          ₦{NAIRA.format(b.price_naira)}
                          {b.deposit_naira
                            ? ` · ₦${NAIRA.format(b.deposit_naira)} deposit`
                            : ""}
                        </dd>
                      </div>
                      {b.address && (
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={14}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <dt className="sr-only">Address</dt>
                          <dd className="min-w-0 wrap-break-word">{b.address}</dd>
                        </div>
                      )}
                    </dl>

                    {/* Deposit: the customer messages the provider on WhatsApp */}
                    {b.deposit_naira ? (
                      b.deposit_paid ? (
                        <p className="mt-3 inline-flex rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-semibold text-[#1E6B3A]">
                          Deposit received
                        </p>
                      ) : b.status === "accepted" && !ended ? (
                        b.whatsapp_number ? (
                          <div className="mt-3 space-y-2">
                            <a
                              href={whatsappLink(
                                b.whatsapp_number,
                                `Hi, I'm ${session.user.name}. I booked ${b.service_name} on ${whenFmt.format(b.start_at)} (Ref ${b.reference}). How can I pay the ₦${NAIRA.format(b.deposit_naira)} deposit?`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1F8F4E] px-5 text-sm font-semibold text-white transition hover:bg-[#177A41]"
                            >
                              <MessageCircle size={16} aria-hidden="true" />
                              Message provider on WhatsApp
                            </a>
                            <p className="text-xs text-[#6B4A5C]">
                              Only pay the account details your provider gives
                              you in this chat, and keep your payment proof.
                            </p>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-[#6B4A5C]">
                            Your provider hasn&apos;t added a WhatsApp number
                            yet. They&apos;ll contact you about the deposit.
                          </p>
                        )
                      ) : null
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[#6B4A5C]">
                        Ref {b.reference}
                      </p>
                      {(b.status === "pending" ||
                        (b.status === "accepted" && !ended)) && (
                        <CancelButton id={b.id} />
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}