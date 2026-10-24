import { Suspense } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Search,SlidersHorizontal} from "lucide-react";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/spinner";
import StoreAvatar from "@/components/store-avatar";
import { DELIVERY_LABEL } from "@/lib/provider";
import { getExploreStores } from "@/lib/explore";


export const metadata = { title: "Explore | Doka" };

const NAIRA = new Intl.NumberFormat("en-NG");

const FILTERS = [
  ["all", "All"],
  ["in_store", "In store"],
  ["home", "Home service"],
] as const;

type SearchParams = Promise<{ q?: string; type?: string }>;

// No await here, so nothing dynamic runs outside Suspense.
export default function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#701E47] px-6 py-16 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -left-10 top-0 h-80 w-80 rounded-full border border-white/10 md:h-125 md:w-125 md:border-2" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#8C2B5C]/70 md:-bottom-48 md:-left-40 md:h-96 md:w-96" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl py-4 lg:px-5">
            <h1 className=" max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Every service. One <span>market</span>.
            </h1>
            <p className=" py-6 mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
              Find a trusted provider near you and book in a few clicks.
            </p>
          </div>
        </section>

        {/* Search, filters and stores */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <Suspense
            fallback={<Spinner fullScreen={false} label="Loading stores..." />}
          >
            <ExploreContent searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
    </>
  );
}

async function ExploreContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", type = "all" } = await searchParams;
  const stores = await getExploreStores(q, type);

  return (
    <>
     
<form className="space-y-3">
  <div className="flex items-center gap-2">
    {/* Search box */}
    <div className="relative min-w-0 flex-1">
      <Search
        size={18}
        aria-hidden="true"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B4A5C]"
      />
      <input
        name="q"
        defaultValue={q}
        aria-label="Search stores"
        placeholder="Search stores, services or location"
        className="min-h-11 w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm text-[#2B0F20] ring-1 ring-[#EBD3E0] outline-none focus:ring-2 focus:ring-[#8E2B5C]"
      />
    </div>

    {/* Filter button + panel (no JavaScript needed) */}
    <details className="relative">
      <summary className="relative flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-[#4A3340] ring-1 ring-[#EBD3E0] hover:bg-[#F6E6F0] [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Filter</span>
        {type !== "all" && (
          <span
            aria-label="Filter applied"
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#8E2B5C] ring-2 ring-white"
          />
        )}
      </summary>

      <fieldset className="absolute right-0 z-20 mt-2 w-56 space-y-1 rounded-2xl bg-white p-3 shadow-[0_16px_40px_-20px_rgba(111,29,68,0.45)] ring-1 ring-[#EBD3E0]">
        <legend className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-[#6B4A5C]">
          Service type
        </legend>
        {FILTERS.map(([value, text]) => (
          <label key={value} className="block cursor-pointer">
            <input
              type="radio"
              name="type"
              value={value}
              defaultChecked={type === value}
              className="peer sr-only"
            />
            <span className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#4A3340] transition hover:bg-[#F6E6F0] peer-checked:bg-[#8E2B5C] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#8E2B5C]">
              {text}
            </span>
          </label>
        ))}
        <p className="px-2 pt-2 text-xs text-[#6B4A5C]">
          Pick one, then tap Search.
        </p>
      </fieldset>
    </details>

    {/* Search button */}
    <button
      type="submit"
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#8E2B5C] px-4 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-6"
    >
      <Search size={18} aria-hidden="true" />
      <span className="hidden sm:inline">Search</span>
      <span className="sr-only sm:hidden">Search</span>
    </button>
  </div>

  {(q || type !== "all") && (
    <p className="text-sm text-[#6B4A5C]">
      Showing results
      {q && <> for <span className="font-semibold text-[#2B0F20]">&ldquo;{q}&rdquo;</span></>}
      {type !== "all" && <> · {FILTERS.find(([v]) => v === type)?.[1]}</>}
      {" "}·{" "}
      <Link href="/explore" className="font-semibold text-[#8E2B5C] underline underline-offset-4">
        Clear
      </Link>
    </p>
  )}
</form>

      {stores.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-[#FBF3F8] p-10 text-center text-sm text-[#6B4A5C]">
          No stores found. Try a different search.
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-[#6B4A5C]">
           All Stores
          </p>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/${s.slug}`}
                  className="group block h-full overflow-hidden rounded-3xl bg-white ring-1 ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(111,29,68,0.35)]"
                >
                  <div className="h-20 bg-linear-to-br from-[#6F1D44] via-[#8E2B5C] to-[#C46A94]" />
                  <div className="px-5 pb-5">
                    <StoreAvatar
                      name={s.name}
                      logoUrl={s.logo_url}
                      className="-mt-8 h-14 w-14 rounded-2xl text-xl"
                    />

                    <div className="mt-3 flex items-center gap-1.5">
                      <h3 className="min-w-0 truncate font-semibold text-[#2B0F20] group-hover:text-[#8E2B5C]">
                        {s.name}
                      </h3>
                      <BadgeCheck
                        size={16}
                        className="shrink-0 text-[#8E2B5C]"
                        aria-label="Verified"
                      />
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-sm text-[#6B4A5C]">
                      <MapPin size={14} aria-hidden="true" />
                      <span className="truncate">{s.location}</span>
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs font-medium">
                      <span className="rounded-full bg-[#F6E6F0] px-2.5 py-1 text-[#4A3340]">
                        {DELIVERY_LABEL[s.delivery_type]}
                      </span>
                      <span className="text-right text-[#6B4A5C]">
                        {s.service_count} service
                        {s.service_count === 1 ? "" : "s"} · from{" "}
                        <span className="font-semibold text-[#6F1D44]">
                          ₦{NAIRA.format(s.from_price)}
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}