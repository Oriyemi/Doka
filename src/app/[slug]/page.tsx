import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
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
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
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
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#EBD3E0]/70">
        <div className="h-24 bg-linear-to-br sm:h-32" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
            <StoreAvatar
              name={store.name}
              logoUrl={store.logo_url}
              className={`${display} h-20 w-20 rounded-3xl text-4xl sm:h-24 sm:w-24 sm:text-5xl`}
            />
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`${display} text-2xl font-semibold tracking-tight text-[#2B0F20] sm:text-3xl`}
                >
                  {store.name}
                </h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F6E6F0] px-2.5 py-1 text-xs font-semibold text-[#6B1F45]">
                    <BadgeCheck size={14} aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-[#4A3340]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <MapPin size={14} aria-hidden="true" />
              {store.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <Truck size={14} aria-hidden="true" />
              {DELIVERY_LABEL[store.delivery_type]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <Scissors size={14} aria-hidden="true" />
              {rows.length} service{rows.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className={`${card} space-y-5`}>
        <h2 className={cardTitle}>Services</h2>

        {rows.length === 0 ? (
          <p className="rounded-2xl bg-[#FBF3F8] p-6 text-sm text-[#6B4A5C]">
            This provider hasn&apos;t added any services yet.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {rows.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl bg-[#FBF3F8] p-4 ring-1 ring-[#EBD3E0]/60 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 font-semibold text-[#2B0F20]">
                    {s.name}
                  </p>
                  <p
                    className={`${display} shrink-0 text-xl font-semibold text-[#6F1D44]`}
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

                {verified ? (
                  <Link
                    href={`/book/${s.id}`}
                    className={`${btnPrimary} mt-4 w-full`}
                  >
                    Book
                  </Link>
                ) : (
                  <p className="mt-4 rounded-xl bg-white px-4 py-3 text-center text-xs font-medium text-[#6B4A5C] ring-1 ring-[#EBD3E0]">
                    Booking opens once this provider is verified.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}