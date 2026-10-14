"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResent(false);
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/onboarding",
    });

    setLoading(false);

    if (error) {
      if (error.status === 403) {
        setUnverified(true);
        setError("Please verify your email before signing in.");
      } else {
        setError(error.message ?? "Invalid email or password.");
      }
      return;
    }

    router.push("/onboarding");
  }

  async function handleResend() {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/onboarding",
    });

    // 429 means the resend limit in src/lib/auth.ts was hit
    if (error) {
      setError(
        error.message ?? "Could not resend the email. Please try again later.",
      );
      return;
    }

    setError(null);
    setResent(true);
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/onboarding" });
  }

  return (
    <main className="min-h-screen bg-white md:grid md:grid-cols-2">
      {/* Brand panel: header on mobile, left half on desktop */}
      <section className="relative overflow-hidden rounded-b-[28px] bg-[#701E47] px-6 pb-7 pt-12 text-white md:flex md:flex-col md:rounded-none md:px-14 md:py-12">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">
            Doka<span className="text-white/60">.</span>
          </h1>
          <p className="mt-1 text-xs text-white/70 md:hidden">
            Every service. One market.
          </p>
        </div>

        <p className="hidden text-5xl font-extrabold leading-tight md:my-auto md:block">
          Every service.
          <br />
          One market.
        </p>

        <div className="absolute -bottom-32 -right-24 hidden h-80 w-80 rounded-full bg-[#8C2B5C] md:block" />
      </section>

      {/* Form */}
      <section className="flex justify-center px-6 py-8 md:items-center md:px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-[#2A0A1B]">
            Welcome back
          </h2>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-5 w-full rounded-xl border border-[#8C2B5C] bg-white py-3 text-sm font-medium text-[#8C2B5C] transition hover:bg-[#8C2B5C]/5"
          >
            Continue with Google
          </button>

          <p className="my-4 text-center text-xs text-gray-500">or use email</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#D9A3BD] px-3 py-3 text-sm outline-none transition focus:border-[#8C2B5C]"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#2A0A1B]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#8C2B5C]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            {unverified && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resent}
                className="text-sm font-semibold text-[#8C2B5C] underline disabled:no-underline disabled:opacity-60"
              >
                {resent
                  ? "Verification email sent"
                  : "Resend verification email"}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#8C2B5C] py-3 text-sm font-semibold text-white transition hover:bg-[#701E47] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-bold text-[#8C2B5C]">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
