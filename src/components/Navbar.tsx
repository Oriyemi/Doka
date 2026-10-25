
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className=" isolate overflow-hidden bg-[#701E47] text-white sticky top-0 z-40 ">
      
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
      </div>

      {/* Navbar content */}
      <div className="relative z-10 mx-auto flex min-h-18 max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-white"
        >
          Doka<span className="text-[#8C2B5C]/60">.</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex lg:gap-10 mr-100">
          <Link
            href="/explore"
            className="text-sm font-bold transition hover:text-white/80"
          >
            Explore
          </Link>

          <Link
            href="/dashboard/bookings"
            className="text-sm text-white/70 transition hover:text-white"
          >
            My Bookings
          </Link>

          <Link
            href="/provider/dashboard"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Become a provider
          </Link>
        </div>

        {/* Switch account — desktop */}
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10 md:flex"
        >
          Switch account
          <ChevronDown size={16} />
        </button>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-white/20 p-2 transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="relative z-10 border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/explore"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Explore
            </Link>

            <Link
              href="/dashboard/bookings"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              My Bookings
            </Link>

            <Link
              href="/provider/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Become a provider
            </Link>

            <button
              type="button"
              className="mt-2 flex items-center justify-between rounded-lg border border-white/20 px-3 py-3 text-sm transition hover:bg-white/10"
            >
              Switch account
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
