import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  MapPin,
  Truck,
  Wallet,
  Scissors,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StoreAvatar from "@/components/store-avatar";
import Spinner from "@/components/spinner";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, type Store } from "@/lib/provider";
import {
  btnPrimary,
  card,
  cardTitle,
  display,
} from "@/app/provider/dashboard/ui";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const { rows } = await db.query<{ name: string }>(
    `SELECT name FROM store WHERE lower(slug) = lower($1) LIMIT 1`,
    [slug],
  );
  return { title: rows[0] ? `${rows[0].name} | Doka` : "Store | Doka" };
}

const NAIRA = new Intl.NumberFormat("en-NG");

type Service = {
  id: string;
  name: string;
  price_naira: number;
  duration_min: number;
  deposit_naira: number | null;
};

const duration = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

// No await here, so nothing dynamic runs outside Suspense.
export default function PublicStorePage({ params }: { params: Params }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 sm:pb-12 lg:px-8 2xl:max-w-352">
        <Link
          href="/explore"
          className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#6F1D44] hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to explore
        </Link>
        <Suspense
          fallback={<Spinner fullScreen={false} label="Loading store..." />}
        >
          <StoreContent params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function StoreContent({ params }: { params: Params }) {
  const { slug } = await params;

  const { rows: storeRows } = await db.query<Store>(
    `SELECT id, name, slug, location, delivery_type, verification_status, logo_url
     FROM store WHERE lower(slug) = lower($1) LIMIT 1`,
    [slug],
  );
  const store = storeRows[0];
  if (!store) notFound();

  const verified = store.verification_status === "verified";

  const { rows } = await db.query<Service>(
    `SELECT id, name, price_naira, duration_min, deposit_naira
     FROM service WHERE store_id = $1 AND active ORDER BY created_at`,
    [store.id],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Store header */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#EBD3E0]/70">
        <div
          aria-hidden="true"
          className="h-28 bg-linear-to-br from-[#6F1D44] to-[#8C2B5C] sm:h-36 lg:h-44 2xl:h-52"
        />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6 lg:-mt-16">
            <StoreAvatar
              name={store.name}
              logoUrl={store.logo_url}
              className={`${display} h-24 w-24 shrink-0 rounded-3xl text-4xl ring-4 ring-white sm:h-28 sm:w-28 sm:text-5xl lg:h-32 lg:w-32`}
            />
            <div className="min-w-0 sm:pb-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1
                  className={`${display} min-w-0 wrap-break-word text-2xl font-semibold tracking-tight text-[#2B0F20] sm:text-3xl lg:text-4xl`}
                >
                  {store.name}
                </h1>
                {verified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F6E6F0] px-2.5 py-1 text-xs font-semibold text-[#6B1F45]">
                    <BadgeCheck size={14} aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-[#4A3340] sm:mt-6">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <MapPin size={14} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 wrap-break-word">{store.location}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <Truck size={14} className="shrink-0" aria-hidden="true" />
              {DELIVERY_LABEL[store.delivery_type]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <Scissors size={14} className="shrink-0" aria-hidden="true" />
              {rows.length} service{rows.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={`${card} space-y-5 lg:space-y-6`}>
        <h2 className={cardTitle}>Services</h2>

        {rows.length === 0 ? (
          <p className="rounded-2xl bg-[#FBF3F8] p-6 text-sm text-[#6B4A5C]">
            This provider hasn&apos;t added any services yet.
          </p>
        ) : (
          // Auto-fills as many columns as fit (min 17rem each). No breakpoints needed.
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3 sm:gap-4 lg:gap-5">
            {rows.map((s) => (
              <li
                key={s.id}
                className="flex min-w-0 flex-col rounded-2xl bg-[#FBF3F8] p-4 ring-1 ring-[#EBD3E0]/60 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 wrap-break-word font-semibold text-[#2B0F20]">
                    {s.name}
                  </p>
                  <p
                    className={`${display} shrink-0 whitespace-nowrap text-lg font-semibold text-[#6F1D44] sm:text-xl`}
                  >
                    ₦{NAIRA.format(s.price_naira)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[#6B4A5C]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#EBD3E0]">
                    <Clock size={12} aria-hidden="true" />
                    {duration(s.duration_min)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#EBD3E0]">
                    <Wallet size={12} aria-hidden="true" />
                    {s.deposit_naira
                      ? `₦${NAIRA.format(s.deposit_naira)} deposit`
                      : "No deposit"}
                  </span>
                </div>

                {/* mt-auto keeps every Book button aligned at the bottom of its row */}
                <div className="mt-auto pt-4">
                  {verified ? (
                    <Link
                      href={`/book/${s.id}`}
                      className={`${btnPrimary} min-h-11 w-full`}
                    >
                      Book
                    </Link>
                  ) : (
                    <p className="rounded-xl bg-white px-4 py-3 text-center text-xs font-medium text-[#6B4A5C] ring-1 ring-[#EBD3E0]">
                      Booking opens once this provider is verified.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}