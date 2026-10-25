import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/spinner";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = Promise<{ reference: string }>;

const NAIRA = new Intl.NumberFormat("en-NG");
const whenFmt = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function ThanksPage({ params }: { params: Params }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
        <Suspense fallback={<Spinner fullScreen={false} label="Loading..." />}>
          <Content params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Content({ params }: { params: Params }) {
  const { reference } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { rows } = await db.query<{
    reference: string;
    start_at: Date;
    price_naira: number;
    service_name: string;
    store_name: string;
  }>(
    `SELECT b.reference, b.start_at, b.price_naira,
            s.name AS service_name, st.name AS store_name
     FROM booking b
     JOIN service s ON s.id = b.service_id
     JOIN store st ON st.id = b.store_id
     WHERE b.reference = $1 AND b.customer_id = $2`,
    [reference, session.user.id],
  );
  const b = rows[0];
  if (!b) notFound();

  return (
    <div className="rounded-3xl border border-[#EBD3E0] bg-white p-6 text-center shadow-xl shadow-[#701E47]/10 sm:p-10">
      <CircleCheck size={48} className="mx-auto text-primary" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-extrabold text-[#2B0F20] sm:text-3xl">
        Request sent
      </h1>
      <p className="mt-2 text-sm text-[#6B4A5C]">
        {b.store_name} will accept or decline your booking. We&apos;ll email you either way.
      </p>

      <dl className="mt-6 divide-y divide-[#F3E7EE] rounded-2xl bg-[#FBF3F8] px-4 text-left text-sm">
        {[
          ["Service", b.service_name],
          ["Provider", b.store_name],
          ["When", whenFmt.format(b.start_at)],
          ["Price", `₦${NAIRA.format(b.price_naira)}`],
          ["Reference", b.reference],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="text-[#6B4A5C]">{k}</dt>
            <dd className="text-right font-semibold text-[#2B0F20]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/explore"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-primary"
        >
          Back to explore
        </Link>
      </div>
    </div>
  );
}