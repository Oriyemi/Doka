import Link from "next/link";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import PageHeader from "../page-header";
import Stars from "../overview";
import { btnOutline, btnPrimary, card, cardTitle, display } from "../ui";

const PAGE_SIZE = 10;

type Row = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  customer: string;
  service: string;
};

const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" });

const initialsOf = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: raw } = await searchParams;
  const store = await getProviderStore();

  const [summary, dist] = await Promise.all([
    db.query<{ avg: string | null; total: number }>(
      `SELECT round(avg(rating)::numeric, 1)::text AS avg, count(*)::int AS total
       FROM review WHERE store_id = $1`,
      [store.id],
    ),
    db.query<{ rating: number; n: number }>(
      `SELECT rating::int, count(*)::int AS n FROM review WHERE store_id = $1 GROUP BY rating`,
      [store.id],
    ),
  ]);

  const { avg, total } = summary.rows[0];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(Number(raw) || 1, 1), pages);
  const counts = new Map(dist.rows.map((d) => [d.rating, d.n]));

  const { rows } = await db.query<Row>(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS customer, s.name AS service
     FROM review r
     JOIN "user" u ON u.id = r.customer_id
     JOIN booking b ON b.id = r.booking_id
     JOIN service s ON s.id = b.service_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [store.id, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Reviews"
        subtitle="Clients can review you after a completed booking."
      />

      <section className="grid gap-6 overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06),0_16px_40px_-20px_rgba(111,29,68,0.28)] sm:p-8 md:grid-cols-[14rem_1fr] md:items-center md:gap-10">
        <div className="rounded-2xl bg-[#6F1D44] p-6 text-center text-white">
          <p className={`${display} text-6xl font-semibold tracking-tight sm:text-7xl`}>
            {avg ?? "–"}
          </p>
          {avg && (
            <div className="mt-2 text-lg [&_*]:!text-[#F6E6F0] [&_span_span]:!text-white/30">
              <Stars value={Number(avg)} />
            </div>
          )}
          <p className="mt-2 text-sm text-white/80">
            {total} review{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = counts.get(n) ?? 0;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3 text-sm text-[#4A3340]">
                <span className="w-12 shrink-0 font-medium">{n} star</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F6E6F0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8E2B5C] to-[#C46A94]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[#6B4A5C]">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={card}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={cardTitle}>All reviews</h2>
          {total > 0 && (
            <p className="text-sm text-[#6B4A5C]">
              Page {page} of {pages}
            </p>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#FBF3F8] p-6 text-sm leading-relaxed text-[#6B4A5C]">
            No reviews yet. They show up here after clients finish a booking.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl bg-[#FBF3F8] p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6F1D44] text-sm font-bold text-white">
                    {initialsOf(r.customer)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <p className="truncate font-semibold text-[#2B0F20]">{r.customer}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="text-sm text-[#6B4A5C]">
                      {r.service} · {date.format(r.created_at)}
                    </p>
                    {r.comment && (
                      <p className="mt-3 break-words leading-relaxed text-[#2B0F20]">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between"
          >
            {page > 1 ? (
              <Link href={`?page=${page - 1}`} className={btnOutline}>
                Previous
              </Link>
            ) : (
              <span />
            )}
            {page < pages ? (
              <Link href={`?page=${page + 1}`} className={btnPrimary}>
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}