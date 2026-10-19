import { Suspense } from "react";
import { CircleCheck, Save } from "lucide-react";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import Spinner from "@/components/spinner";
import PageHeader from "../page-header";
import { btnPrimary, card } from "../ui";
import { saveAvailability } from "./actions";

const DAYS: [number, string][] = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
];

type Row = { weekday: number; s: string; e: string };

const time =
  "min-w-0 flex-1 rounded-xl border border-[#E3C6D6] bg-white px-3 py-3 text-base text-[#2B0F20] outline-none transition focus:border-[#8E2B5C] focus:ring-4 focus:ring-[#8E2B5C]/10";

export default function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Availability"
        subtitle="Switch on the days you work and set your hours. Clients can only book inside these times, and never at a time that's already taken."
      />

      <Suspense
        fallback={<Spinner fullScreen={false} label="Loading availability..." />}
      >
        <AvailabilityContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AvailabilityContent({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const store = await getProviderStore();

  const { rows } = await db.query<Row>(
    `SELECT weekday, to_char(start_time,'HH24:MI') AS s, to_char(end_time,'HH24:MI') AS e
     FROM availability WHERE store_id = $1`,
    [store.id],
  );
  const byDay = new Map(rows.map((r) => [r.weekday, r]));

  return (
    <form action={saveAvailability} className={`${card} space-y-2`}>
      {DAYS.map(([d, name]) => {
        const row = byDay.get(d);
        return (
          <div
            key={d}
            className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b border-[#F3E7EE] py-4 last:border-0 sm:grid-cols-[auto_8rem_1fr]"
          >
            {/* The checkbox is hidden; the switch below is its label */}
            <input
              id={`on_${d}`}
              type="checkbox"
              name={`on_${d}`}
              defaultChecked={!!row}
              aria-label={name}
              className="peer sr-only"
            />
            <label
              htmlFor={`on_${d}`}
              aria-hidden="true"
              className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-[#D9C3CF] transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#8E2B5C] peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-[#8E2B5C]/25"
            />
            <label
              htmlFor={`on_${d}`}
              aria-hidden="true"
              className="cursor-pointer text-base font-semibold text-[#2B0F20]"
            >
              {name}
            </label>

            <div className="col-span-2 flex items-center gap-2 text-sm text-[#6B4A5C] opacity-45 transition-opacity peer-checked:opacity-100 sm:col-span-1">
              <input
                type="time"
                name={`start_${d}`}
                defaultValue={row?.s ?? "09:00"}
                className={time}
                aria-label={`${name} start`}
              />
              <span>to</span>
              <input
                type="time"
                name={`end_${d}`}
                defaultValue={row?.e ?? "17:00"}
                className={time}
                aria-label={`${name} end`}
              />
            </div>
          </div>
        );
      })}

      {saved && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-[#F6E6F0] px-4 py-3 text-sm font-medium text-[#6B1F45]"
        >
          <CircleCheck size={16} className="shrink-0" aria-hidden="true" />
          Availability saved.
        </p>
      )}

      <div className="pt-4">
        <button
          className={`${btnPrimary} inline-flex w-full items-center justify-center gap-2 sm:w-auto sm:px-10`}
        >
          <Save size={18} aria-hidden="true" />
          Save availability
        </button>
      </div>
    </form>
  );
}