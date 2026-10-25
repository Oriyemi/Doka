import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Clock, MapPin, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/spinner";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFreeSlots } from "@/lib/slots"; // adjust to where your function lives
import BookingForm from "./booking-form";

type Params = Promise<{ serviceId: string }>;
type Search = Promise<{ date?: string; slot?: string }>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAIRA = new Intl.NumberFormat("en-NG");
const DAYS_SHOWN = 14;
const TZ = "Africa/Lagos";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }); // 2026-10-26
const weekdayFmt = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, weekday: "short" });
const dayNumFmt = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, month: "short" });
const longFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

type ServiceRow = {
  id: string;
  name: string;
  price_naira: number;
  duration_min: number;
  deposit_naira: number | null;
  delivery_type: string;
  store_id: string;
  store_name: string;
  slug: string;
  verification_status: string;
};

const duration = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

const PLACE: Record<string, string> = {
  in_store: "In store",
  home: "Home service",
  both: "In store or home",
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold sm:text-sm";

function StepHeading({
  n,
  id,
  title,
  hint,
}: {
  n: number;
  id: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {n}
      </span>
      <h2 id={id} className="text-base font-bold text-[#2B0F20] sm:text-lg">
        {title}
      </h2>
      {hint && <span className="ml-auto text-xs text-[#6B4A5C] sm:text-sm">{hint}</span>}
    </div>
  );
}

export default function BookPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="py-24">
            <Spinner fullScreen={false} label="Loading..." />
          </div>
        }
      >
        <BookContent params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function BookContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { serviceId } = await params;
  const sp = await searchParams;
  if (!UUID.test(serviceId)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?redirect=/book/${serviceId}`);

  const { rows } = await db.query<ServiceRow>(
    `SELECT s.id, s.name, s.price_naira, s.duration_min, s.deposit_naira, s.delivery_type,
            st.id AS store_id, st.name AS store_name, st.slug, st.verification_status
     FROM service s JOIN store st ON st.id = s.store_id
     WHERE s.id = $1 AND s.active`,
    [serviceId],
  );
  const service = rows[0];
  if (!service) notFound();
  if (service.verification_status !== "verified") redirect(`/${service.slug}`);

  // Weekdays this provider works (0 = Sunday ... 6 = Saturday)
  const { rows: wd } = await db.query<{ weekday: number }>(
    `SELECT weekday FROM availability WHERE store_id = $1`,
    [service.store_id],
  );
  const workDays = new Set(wd.map((r) => r.weekday));

  // The next 14 days in Lagos time
  const now = Date.now();
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const key = dayKeyFmt.format(new Date(now + i * 86_400_000));
    const noon = new Date(`${key}T12:00:00+01:00`);
    return { key, noon, isOpen: workDays.has(noon.getUTCDay()) };
  });

  // Only trust the URL if it matches something we just checked
  const chosen =
    days.find((d) => d.key === sp.date && d.isOpen) ?? days.find((d) => d.isOpen);
  const slots = chosen
    ? await getFreeSlots(service.store_id, chosen.key, service.duration_min)
    : [];
  const slot = sp.slot && slots.includes(sp.slot) ? sp.slot : undefined;

  const base = `/book/${serviceId}`;

  return (
    <>
      {/* Title band */}
      <div className="relative isolate overflow-hidden bg-[#701E47] pb-24 pt-6 text-white sm:pb-28 sm:pt-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#8C2B5C]/70 md:-bottom-48 md:-left-40 md:h-96 md:w-96" />
          <div className="absolute -right-10 top-0 h-80 w-80 rounded-full border border-white/10 md:h-125 md:w-125 md:border-2" />
        </div>
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <Link
            href={`/${service.slug}`}
            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {service.store_name}
          </Link>
          <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-widest text-white/60 sm:text-sm">
            Book a service
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            {service.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={chip}>₦{NAIRA.format(service.price_naira)}</span>
            <span className={chip}>
              <Clock size={14} aria-hidden="true" />
              {duration(service.duration_min)}
            </span>
            <span className={chip}>
              <Wallet size={14} aria-hidden="true" />
              {service.deposit_naira
                ? `₦${NAIRA.format(service.deposit_naira)} deposit`
                : "No deposit"}
            </span>
            <span className={chip}>
              <MapPin size={14} aria-hidden="true" />
              {PLACE[service.delivery_type] ?? "In store"}
            </span>
          </div>
        </div>
      </div>

      {/* Steps card, pulled up over the band */}
      <main className="relative mx-auto -mt-16 w-full max-w-4xl px-4 pb-16 sm:-mt-20 sm:px-6">
        <div className="rounded-3xl border border-[#EBD3E0] bg-white p-5 shadow-xl shadow-[#701E47]/10 sm:p-8">
          {!chosen ? (
            <p className="rounded-xl bg-[#FBF3F8] p-4 text-sm text-[#6B4A5C]">
              This provider hasn&apos;t set their working hours yet. Please check back soon.
            </p>
          ) : (
            <div className="space-y-7 [&>section+section]:border-t [&>section+section]:border-[#F3E7EE] [&>section+section]:pt-7">
              {/* Date */}
              <section aria-labelledby="date-h">
                <StepHeading n={1} id="date-h" title="Choose a date" hint="Next 14 days" />
                <ul className="grid grid-cols-4 gap-2.5 min-[480px]:grid-cols-5 sm:grid-cols-7">
                  {days.map((d) => {
                    const selected = d.key === chosen.key;
                    const base_ =
                      "flex h-[4.75rem] flex-col items-center justify-center rounded-2xl border-[1.5px] leading-tight transition lg:h-24";
                    const inner = (
                      <>
                        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                          {weekdayFmt.format(d.noon)}
                        </span>
                        <span className="text-xl font-bold">{dayNumFmt.format(d.noon)}</span>
                        <span className="text-xs opacity-70">{monthFmt.format(d.noon)}</span>
                      </>
                    );
                    return (
                      <li key={d.key}>
                        {d.isOpen ? (
                          <Link
                            href={`${base}?date=${d.key}`}
                            scroll={false}
                            aria-current={selected ? "date" : undefined}
                            className={`${base_} ${
                              selected
                                ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                                : "border-[#EBD3E0] bg-white text-[#2B0F20] hover:border-primary hover:bg-[#FBF3F8]"
                            }`}
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div
                            aria-disabled="true"
                            title="Closed"
                            className={`${base_} cursor-not-allowed border-dashed border-[#EBD3E0] bg-[#FBF3F8] text-[#6B4A5C] opacity-55`}
                          >
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Time */}
              <section aria-labelledby="time-h">
                <StepHeading n={2} id="time-h" title="Choose a time" hint="Lagos time" />
                {slots.length === 0 ? (
                  <p className="rounded-xl bg-[#FBF3F8] p-4 text-sm text-[#6B4A5C]">
                    No times left on {longFmt.format(chosen.noon)}. Try another date.
                  </p>
                ) : (
                  <>
                    <ul className="grid grid-cols-3 gap-2.5 min-[480px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6">
                      {slots.map((iso) => {
                        const selected = iso === slot;
                        return (
                          <li key={iso}>
                            <Link
                              href={`${base}?date=${chosen.key}&slot=${encodeURIComponent(iso)}`}
                              scroll={false}
                              aria-current={selected ? "true" : undefined}
                              className={`flex h-10 items-center justify-center gap-1.5 rounded-full border-[1.5px] text-sm font-semibold transition lg:h-11 ${
                                selected
                                  ? "border-primary bg-primary text-white"
                                  : "border-[#EBD3E0] bg-white text-[#2B0F20] hover:border-primary hover:bg-[#FBF3F8]"
                              }`}
                            >
                              {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                              {timeFmt.format(new Date(iso))}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-4 text-sm text-[#6B4A5C]" aria-live="polite">
                      {slot ? (
                        <>
                          Selected:{" "}
                          <b className="text-[#2B0F20]">
                            {longFmt.format(chosen.noon)}, {timeFmt.format(new Date(slot))}
                          </b>
                        </>
                      ) : (
                        "Choose a time to continue."
                      )}
                    </p>
                  </>
                )}
              </section>

              {/* Details */}
              {slot && (
                <section aria-labelledby="details-h">
                  <StepHeading n={3} id="details-h" title="Your details" />
                  <BookingForm
                    serviceId={serviceId}
                    slot={slot}
                    deliveryType={service.delivery_type}
                    defaultName={session.user.name ?? ""}
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}