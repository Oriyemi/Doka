import Link from "next/link";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, getProviderStore } from "@/lib/provider";
import CopyLink from "../copy-link";
import PageHeader from "../page-header";
import { btnOutline, card, cardTitle, display } from "../ui";

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

export default async function StorePage() {
  const store = await getProviderStore();
  const verified = store.verification_status === "verified";
  const initial = store.name.trim()[0]?.toUpperCase() ?? "D";

  const { rows } = await db.query<Service>(
    `SELECT id, name, price_naira, duration_min, deposit_naira
     FROM service WHERE store_id = $1 AND active ORDER BY created_at`,
    [store.id],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Store"
        subtitle="This is how clients see your store."
      />

      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06),0_16px_40px_-20px_rgba(111,29,68,0.28)]">
        {/* Banner */}
        <div className="h-24 bg-linear-to-br from-[#6F1D44] via-[#8E2B5C] to-[#C46A94] sm:h-32" />

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <span
                className={`${display} flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#6F1D44] text-4xl font-semibold text-white ring-4 ring-white sm:h-24 sm:w-24 sm:text-5xl`}
              >
                {initial}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className={`${display} wrap-break-words text-2xl font-semibold tracking-tight text-[#2B0F20] sm:text-3xl`}
                  >
                    {store.name}
                  </h2>
                  {verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F6E6F0] px-2.5 py-1 text-xs font-semibold text-[#6B1F45]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <Link
                      href="/provider/verify"
                      className="rounded-full bg-[#FFF1D6] px-2.5 py-1 text-xs font-semibold text-[#8A5A00] underline underline-offset-2"
                    >
                      Get verified
                    </Link>
                  )}
                </div>
                <p className="mt-1 break-all text-sm text-[#6B4A5C]">
                  doka.app/{store.slug}
                </p>
              </div>
            </div>

            <CopyLink slug={store.slug} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-[#4A3340]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {store.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              {DELIVERY_LABEL[store.delivery_type]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6E6F0] px-3 py-1.5">
              {rows.length} service{rows.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className={`${card} space-y-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={cardTitle}>Services</h2>
          <Link href="/provider/dashboard/services" className={`${btnOutline} min-h-11 px-5`}>
            Manage services
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-[#FBF3F8] p-6 text-sm leading-relaxed text-[#6B4A5C]">
            No services yet. Clients can&apos;t book you until you add one.{" "}
            <Link
              href="/provider/dashboard/services"
              className="font-semibold text-[#8E2B5C] underline underline-offset-4"
            >
              Add your first service
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {rows.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl bg-[#FBF3F8] p-4 ring-1 ring-[#EBD3E0]/60 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 wrap-break-words font-semibold text-[#2B0F20]">
                    {s.name}
                  </p>
                  <p className={`${display} shrink-0 text-xl font-semibold text-[#6F1D44]`}>
                    ₦{NAIRA.format(s.price_naira)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[#6B4A5C]">
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-[#EBD3E0]">
                    {duration(s.duration_min)}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-[#EBD3E0]">
                    {s.deposit_naira
                      ? `₦${NAIRA.format(s.deposit_naira)} deposit`
                      : "No deposit"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}