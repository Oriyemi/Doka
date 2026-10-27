"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Browse services", href: "/explore" },
      { label: "Become a provider", href: "/provider/set-up" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-up" },
      { label: "My bookings", href: "/dashboard/bookings" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const linkCls =
  "text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export default function Footer() {
  // The server and the browser must render the same first value, so the real
  // year is filled in after the page loads. It also keeps this component safe
  // to use on pages that are prerendered.
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative isolate overflow-hidden bg-[#701E47] text-white">
      {/* Decorative circles, same style as the hero */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#8C2B5C]/70 md:-bottom-48 md:-left-40 md:h-96 md:w-96" />
        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10 md:h-96 md:w-96 md:border-2" />
      </div> */}

      <div className="mx-auto max-w-6xl px-6 pb-8 pt-14 md:pt-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-3xl font-extrabold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Doka<span className="text-white/50">.</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Doka connects you with trusted service providers and lets you book
              an appointment in minutes.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-3">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {col.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-sm text-white/60 sm:flex-row sm:text-left">
          <p>© {year} Doka. All rights reserved.</p>
          <p>Every service. One market.</p>
        </div>
      </div>
    </footer>
  );
}