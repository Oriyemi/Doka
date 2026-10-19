import type { Metadata } from "next";
import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF3F8] px-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F6E6F0] text-[#6F1D44]">
        <SearchX size={36} aria-hidden="true" />
      </span>

      <p className="mt-6 text-sm font-semibold tracking-widest text-[#8E2B5C]">
        ERROR 404
      </p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#2B0F20] sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-[#6B4A5C]">
        The page you&apos;re looking for doesn&apos;t exist, or the link may be
        wrong or out of date.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8E2B5C] px-8 text-sm font-semibold text-white shadow-md shadow-[#8E2B5C]/25 transition hover:bg-[#6F1D44]"
      >
        <Home size={18} aria-hidden="true" />
        Back to home
      </Link>
    </main>
  );
}