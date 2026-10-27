"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  LayoutGrid,
  Search,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import { authClient } from "@/lib/auth-client";
import Footer from "@/components/Footer";

const SIGN_IN = "/sign-in";
const SIGN_UP = "/sign-up";
// Where signed-in users land after the splash
const APP_HOME = "/explore";

const steps = [
  {
    title: "Find a service",
    text: "Browse providers by category and see their work, prices and availability.",
  },
  {
    title: "Book a time",
    text: "Pick a date and time that suits you. No back and forth on messages.",
  },
  {
    title: "Get it done",
    text: "Show up, enjoy the service, and leave a review for others.",
  },
];

const features: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Every service in one place",
    text: "From beauty to home repairs, discover trusted providers without searching everywhere.",
    icon: LayoutGrid,
  },
  {
    title: "Easy booking",
    text: "See open slots and confirm your appointment in a few taps.",
    icon: CalendarCheck,
  },
  {
    title: "Verified accounts",
    text: "Email-verified users keep the marketplace safe for customers and providers.",
    icon: ShieldCheck,
  },
  {
    title: "Built for providers",
    text: "Get a booking page, manage your schedule and reach new customers.",
    icon: Store,
  },
];

export default function Home() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // After the splash: anyone signed in goes straight to Explore
  // (or to onboarding if they never finished it).
  useEffect(() => {
    if (!splashDone || isPending || !session) return;
    const onboarded = (session.user as { onboarded?: boolean }).onboarded;
    router.replace(onboarded === false ? "/onboarding" : APP_HOME);
  }, [splashDone, isPending, session, router]);

  // If the session check hangs (for example, no network), stop waiting after
  // 4 seconds and show the landing page instead of a blank screen.
  useEffect(() => {
    if (!splashDone || !isPending) return;
    const t = setTimeout(() => setWaitedTooLong(true), 4000);
    return () => clearTimeout(t);
  }, [splashDone, isPending]);

  // 1. The splash always comes first, for everyone.
  if (!splashDone) {
    return <SplashScreen finishLoading={() => setSplashDone(true)} />;
  }

  // 2. Signed in (redirecting) or still checking: show only the brand color,
  //    so the landing page never flashes for a returning user.
  if (session || (isPending && !waitedTooLong)) {
    return <div className="min-h-dvh bg-[#701E47]" aria-busy="true" />;
  }

  // 3. Not signed in: the landing page.
  return (
    <>
      <main className="min-h-dvh bg-white text-[#2A0A1B]">
        {/* Navbar */}
        <header className="sticky top-0 z-40 border-b border-[#8C2B5C]/10 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-extrabold text-[#701E47]">
              Doka<span className="text-[#8C2B5C]/60">.</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href={SIGN_IN}
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#8C2B5C] transition hover:bg-[#8C2B5C]/5 sm:block"
              >
                Sign in
              </Link>
              <Link
                href={SIGN_UP}
                className="rounded-xl bg-[#8C2B5C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#701E47]"
              >
                Get started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#701E47] text-white">
          <div className="pointer-events-none absolute -bottom-40 -right-32 h-104 w-104 rounded-full bg-[#8C2B5C] md:h-144 md:w-xl" />
          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-32">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
              The service marketplace
            </p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Every service. One market.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
              Doka connects you with trusted service providers and lets you book
              an appointment in minutes. No calls, no waiting, no stress.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={SIGN_UP}
                className="rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-[#701E47] transition hover:bg-white/90"
              >
                Get started
              </Link>
              <Link
                href={SIGN_IN}
                className="rounded-xl border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-extrabold">
            How Doka works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Three simple steps from searching to showing up.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-[#D9A3BD] p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8C2B5C] text-sm font-bold text-white">
                  {i === 0 ? <Search size={18} aria-hidden="true" /> : i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-[#FBF3F7] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-extrabold">
              Why people choose Doka
            </h2>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6E6F0] text-[#8C2B5C]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-bold text-[#701E47]">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-[#701E47] px-6 py-14 text-center text-white md:px-12">
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#8C2B5C]" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold md:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/80">
                Create your free account today, whether you are looking for a
                service or offering one.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={SIGN_UP}
                  className="w-full rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#701E47] sm:w-auto"
                >
                  Create account
                </Link>
                <Link
                  href={SIGN_IN}
                  className="text-sm font-semibold text-white underline underline-offset-4"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
