"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
     Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF3F8] px-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
        <TriangleAlert size={36} aria-hidden="true" />
      </span>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#2B0F20] sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-[#6B4A5C]">
        We hit an unexpected problem. Please try again. If it keeps happening,
        come back in a few minutes.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-[#6B4A5C]/70">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8E2B5C] px-8 text-sm font-semibold text-white shadow-md shadow-[#8E2B5C]/25 transition hover:bg-[#6F1D44]"
        >
          <RotateCcw size={18} aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#8E2B5C] bg-white px-8 text-sm font-semibold text-[#8E2B5C] transition hover:bg-[#8E2B5C]/5"
        >
          <Home size={18} aria-hidden="true" />
          Back to home
        </Link>
          </div>
          
    </main>
  );
}