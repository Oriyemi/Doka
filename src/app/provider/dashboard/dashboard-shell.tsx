"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { display } from "./ui";

const BASE = "/provider/dashboard";

type Item = { label: string; href: string; icon: string };

const MAIN: Item[] = [
  { label: "Overview", href: BASE, icon: "overview" },
  { label: "Store", href: `${BASE}/store`, icon: "store" },
  { label: "Services", href: `${BASE}/services`, icon: "services" },
  { label: "Availability", href: `${BASE}/availability`, icon: "availability" },
  { label: "Bookings", href: `${BASE}/bookings`, icon: "bookings" },
  { label: "Reviews", href: `${BASE}/reviews`, icon: "reviews" },
];

const ACCOUNT: Item[] = [
  { label: "Account settings", href: `${BASE}/account`, icon: "account" },
  { label: "Log out", href: `${BASE}/logout`, icon: "logout" },
];

const ICONS: Record<string, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  store: <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />,
  services: <path d="M12 3l2.2 5.3L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.7z" />,
  availability: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  bookings: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  reviews: <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />,
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function DashboardShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after every navigation
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Esc closes it, and the page behind stops scrolling while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === BASE ? path === BASE : path.startsWith(href);

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "D";

  const link = (l: Item) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={isActive(l.href) ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        isActive(l.href)
          ? "bg-white text-[#6F1D44] shadow-lg shadow-black/10"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon name={l.icon} />
      {l.label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F6E6F0] bg-[radial-gradient(60rem_28rem_at_50%_-8rem,#FFF7FB,transparent)]">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-white/10 bg-[#6F1D44]/95 px-3 backdrop-blur sm:gap-3 sm:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="dashboard-drawer"
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>

        <Link
          href={BASE}
          className={`${display} text-2xl font-semibold tracking-tight text-white`}
        >
          Doka.
        </Link>

        <Link
          href={`${BASE}/account`}
          aria-label="Account settings"
          className="ml-auto flex items-center gap-3 rounded-full py-1 pl-1 pr-1 transition hover:bg-white/10 sm:pr-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6E6F0] text-sm font-bold text-[#6F1D44]">
            {initials}
          </span>
          <span className="hidden max-w-40 truncate text-sm font-semibold text-white sm:block">
            {userName}
          </span>
        </Link>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#2B0F20]/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        id="dashboard-drawer"
        aria-label="Main menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col bg-[#6F1D44] px-4 py-5 shadow-2xl transition-[transform,visibility] duration-300 ease-out sm:px-5 ${
          open ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pl-2">
          <p className={`${display} text-3xl font-semibold tracking-tight text-white`}>
            Doka.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

                <div className="mt-4 hidden items-center gap-3 rounded-2xl bg-white/10 p-3 [@media(min-height:720px)]:flex">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F6E6F0] text-sm font-bold text-[#6F1D44]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-white/70">Provider</p>
          </div>
        </div>

        <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden ">
          {MAIN.map(link)}
        </nav>

        <div className="mt-3 flex flex-col gap-1 border-t border-white/15 pt-3">
          {ACCOUNT.map(link)}
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}