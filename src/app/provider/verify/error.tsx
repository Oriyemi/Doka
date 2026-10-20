"use client";

export default function VerifyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold">Something went wrong while verifying.</p>
      <button
        onClick={reset}
        className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}