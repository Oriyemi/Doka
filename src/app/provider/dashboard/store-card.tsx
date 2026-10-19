import Link from "next/link";
import { DELIVERY_LABEL, type Store } from "@/lib/provider";
import CopyLink from "./copy-link";
import { card, display } from "./ui";

export default function StoreCard({ store }: { store: Store }) {
  const verified = store.verification_status === "verified";
  const initial = store.name.trim()[0]?.toUpperCase() ?? "D";

  return (
    <div
      className={`${card} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`${display} flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#6F1D44] text-2xl font-semibold text-white sm:h-16 sm:w-16 sm:text-3xl`}
        >
          {initial}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`${display} wrap-break-words text-xl font-semibold tracking-tight text-[#2B0F20] sm:text-2xl`}
            >
              {store.name}
            </p>
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
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-[#6B4A5C]">
            <span className="rounded-full bg-[#F6E6F0] px-2.5 py-1">
              {store.location}
            </span>
            <span className="rounded-full bg-[#F6E6F0] px-2.5 py-1">
              {DELIVERY_LABEL[store.delivery_type]}
            </span>
          </div>
        </div>
      </div>

      <CopyLink slug={store.slug} />
    </div>
  );
}