"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import AuthShell from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (!token) return;

    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);

    if (error) {
      setError(
        error.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : (error.message ?? "Could not reset your password. Please try again."),
      );
      return;
    }
    setDone(true);
  }

  // Missing or expired link
  if (!token || linkError) {
    return (
      <AuthShell>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert size={24} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-[#2A0A1B]">
          This link isn&apos;t valid
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          The reset link is invalid or has expired. Request a new one and try
          again.
        </p>
        <Link
          href="/forget-password"
          className="mt-6 block w-full rounded-xl bg-[#8C2B5C] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#701E47]"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6E6F0] text-[#8C2B5C]">
          <CircleCheck size={24} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-[#2A0A1B]">
          Password updated
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          You&apos;ve been signed out of your other devices. Sign in with your
          new password.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 block w-full rounded-xl bg-[#8C2B5C] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#701E47]"
        >
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h2 className="text-2xl font-extrabold text-[#2A0A1B]">
        Set a new password
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Choose a password with at least 8 characters.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-semibold text-[#2A0A1B]"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-[#D9A3BD] py-3 pl-3 pr-11 text-sm outline-none transition focus:border-[#8C2B5C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8C2B5C]/70 transition hover:text-[#8C2B5C]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1 block text-xs font-semibold text-[#2A0A1B]"
          >
            Confirm new password
          </label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
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
              Updating...
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </AuthShell>
  );
}