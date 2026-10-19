"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import AuthShell from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (error) {
      setError(
        error.status === 429
          ? "Too many requests. Please wait a few minutes and try again."
          : (error.message ?? "Something went wrong. Please try again."),
      );
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell>
      {sent ? (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6E6F0] text-[#8C2B5C]">
            <MailCheck size={24} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-[#2A0A1B]">
            Check your email
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            If an account exists for{" "}
            <span className="font-semibold">{email}</span>, we&apos;ve sent a
            link to reset your password. It may take a minute to arrive, so
            check your spam folder too.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 block w-full rounded-xl border border-[#8C2B5C] bg-white py-3 text-center text-sm font-medium text-[#8C2B5C] transition hover:bg-[#8C2B5C]/5"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-[#2A0A1B]">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-semibold text-[#2A0A1B]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#D9A3BD] px-3 py-3 text-sm outline-none transition focus:border-[#8C2B5C]"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C2B5C] py-3 text-sm font-semibold text-white transition hover:bg-[#701E47] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <Link
            href="/sign-in"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C2B5C]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  );
}