import { Suspense } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Check,
  CircleCheck,
  History,
  Inbox,
  X,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import Spinner from "@/components/spinner";
import PageHeader from "../page-header";
import StoreCard from "../store-card";
import { btnOutline, btnPrimary, card, cardTitle, display } from "../ui";
import { respond, markDepositPaid } from "./actions";

const TABS = [
  ["incoming", "Incoming"],
  ["upcoming", "Upcoming"],
  ["previous", "Previous"],
] as const;

const TAB_ICON: Record<(typeof TABS)[number][0], LucideIcon> = {
  incoming: Inbox,
  upcoming: CalendarCheck,
  previous: History,
};

const FILTER = {
  incoming: "b.status = 'pending'",
  upcoming: "b.status = 'accepted' AND b.end_at > now()",
  previous:
    "(b.status IN ('declined','cancelled','completed') OR (b.status = 'accepted' AND b.end_at <= now()))",
};

const EMPTY = {
  incoming: "No new requests. When a client books you, it shows up here.",
  upcoming:
    "Nothing coming up. Accepted bookings appear here until they're done.",
  previous: "No past bookings yet.",
};

type Row = {
  id: string;
  reference: string;
  customer: string;
  service: string;
  start_at: Date;
  status: string;
  deposit_paid: boolean;
  deposit_naira: number | null;
};

const NAIRA = new Intl.NumberFormat("en-NG");
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

const STATUS_STYLE: Record<string, string> = {
  Completed: "bg-[#F6E6F0] text-[#6B1F45]",
  Declined: "bg-red-50 text-red-700",
  Cancelled: "bg-[#EFEAEC] text-[#5B4A53]",
};

const STATUS_ICON: Record<string, LucideIcon> = {
  Completed: CircleCheck,
  Declined: X,
  Cancelled: CalendarX,
};

const label = (r: Row) => {
  if (r.status === "accepted") return "Completed";
  return r.status[0].toUpperCase() + r.status.slice(1);
};

export default function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Bookings"
        subtitle="Reply to new requests and keep track of who's coming."
      />

      <Suspense
        fallback={<Spinner fullScreen={false} label="Loading bookings..." />}
      >
        <BookingsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BookingsContent({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: raw } = await searchParams;
  const tab = (TABS.find(([k]) => k === raw)?.[0] ??
    "incoming") as keyof typeof FILTER;
  const store = await getProviderStore();

  const { rows } = await db.query<Row>(
    `SELECT b.id, b.reference, b.start_at, b.status, b.deposit_paid, b.deposit_naira,
            u.name AS customer, s.name AS service
     FROM booking b
     JOIN service s ON s.id = b.service_id
     JOIN "user" u ON u.id = b.customer_id
     WHERE b.store_id = $1 AND ${FILTER[tab]}
     ORDER BY b.start_at ${tab === "previous" ? "DESC" : "ASC"}`,
    [store.id],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <StoreCard store={store} />

      <nav
        aria-label="Booking status"
        className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-[#EBD3E0]/70 sm:inline-grid sm:w-auto sm:min-w-96"
      >
        {TABS.map(([key, name]) => {
          const Icon = TAB_ICON[key];
          return (
            <Link
              key={key}
              href={`?tab=${key}`}
              aria-current={tab === key ? "page" : undefined}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-sm font-semibold transition sm:px-6 ${
                tab === key
                  ? "bg-[#8E2B5C] text-white shadow-md shadow-[#8E2B5C]/25"
                  : "text-[#4A3340] hover:bg-[#F6E6F0]"
              }`}
            >
              <Icon size={16} className="hidden sm:block" aria-hidden="true" />
              {name}
            </Link>
          );
        })}
      </nav>

      <section className={card}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={cardTitle}>{TABS.find(([k]) => k === tab)?.[1]}</h2>
          <p className="text-sm text-[#6B4A5C]">
            {rows.length} booking{rows.length === 1 ? "" : "s"}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FBF3F8] p-6 text-sm leading-relaxed text-[#6B4A5C]">
            <Calendar size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{EMPTY[tab]}</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {rows.map((r) => {
              const status = label(r);
              const StatusIcon = STATUS_ICON[status] ?? CircleCheck;
              const hasDeposit = !!r.deposit_naira;
              const owesDeposit = hasDeposit && !r.deposit_paid;
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#FBF3F8] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-[#6F1D44] ring-1 ring-[#EBD3E0]">
                      <span
                        className={`${display} text-2xl font-semibold leading-none`}
                      >
                        {dayFmt.format(r.start_at)}
                      </span>
                      <span className="mt-1 text-xs font-semibold">
                        {monFmt.format(r.start_at)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#2B0F20]">
                        {r.customer}
                      </p>
                      <p className="truncate text-sm text-[#6B4A5C]">
                        {r.service} · {timeFmt.format(r.start_at)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {tab === "incoming" && r.deposit_paid && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F4E8] px-2.5 py-0.5 text-xs font-semibold text-[#1F6B3A]">
                            <CircleCheck size={12} aria-hidden="true" />
                            Deposit paid
                          </span>
                        )}
                        {tab === "upcoming" && hasDeposit && (
                          r.deposit_paid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F4E8] px-2.5 py-0.5 text-xs font-semibold text-[#1F6B3A]">
                              <CircleCheck size={12} aria-hidden="true" />
                              Deposit received
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#FFF1D6] px-2.5 py-0.5 text-xs font-semibold text-[#8A5A00]">
                              Deposit pending · ₦{NAIRA.format(r.deposit_naira!)}
                            </span>
                          )
                        )}
                        {(tab === "upcoming" || tab === "previous") && (
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#6B4A5C] ring-1 ring-[#EBD3E0]">
                            Ref {r.reference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {tab === "incoming" && (
                    <form
                      action={respond}
                      className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0"
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        name="decision"
                        value="accept"
                        className={`${btnPrimary} inline-flex items-center justify-center gap-2`}
                      >
                        <Check size={16} aria-hidden="true" />
                        Accept
                      </button>
                      <button
                        name="decision"
                        value="decline"
                        className={`${btnOutline} inline-flex items-center justify-center gap-2`}
                      >
                        <X size={16} aria-hidden="true" />
                        Decline
                      </button>
                    </form>
                  )}

                  {tab === "upcoming" && owesDeposit && (
                    <form action={markDepositPaid} className="sm:shrink-0">
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        className={`${btnPrimary} inline-flex w-full items-center justify-center gap-2 sm:w-auto`}
                      >
                        <Check size={16} aria-hidden="true" />
                        Mark deposit received
                      </button>
                    </form>
                  )}

                  {tab === "previous" && (
                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        STATUS_STYLE[status] ?? STATUS_STYLE.Completed
                      }`}
                    >
                      <StatusIcon size={14} aria-hidden="true" />
                      {status}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}