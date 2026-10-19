import Link from "next/link";
import { btnOutline, btnPrimary, display } from "../ui";
import { signOut } from "./actions";

export default function LogoutPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center">
      <div className="w-full rounded-3xl bg-white p-6 text-center ring-1 ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06),0_16px_40px_-20px_rgba(111,29,68,0.28)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F6E6F0] text-[#6F1D44]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </span>

        <h1
          className={`${display} mt-5 text-3xl font-semibold tracking-tight text-[#2B0F20] sm:text-4xl`}
        >
          Log out of Doka?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6B4A5C] sm:text-base">
          You&apos;ll need to sign in again to manage your store and bookings.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <form action={signOut}>
            <button className={`${btnPrimary} w-full`}>Log out</button>
          </form>
          <Link href="/provider/dashboard" className={`${btnOutline} w-full`}>
            Stay signed in
          </Link>
        </div>
      </div>
    </div>
  );
}