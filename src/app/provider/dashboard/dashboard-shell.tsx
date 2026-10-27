"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  CalendarCheck,
  CalendarDays,
  Clock,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Scissors,
  Store,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { display } from "./ui";

const BASE = "/provider/dashboard";

type Item = { label: string; href: string; icon: LucideIcon };

const MAIN: Item[] = [
  { label: "Overview", href: BASE, icon: LayoutDashboard },
  { label: "Store", href: `${BASE}/store`, icon: Store },
  { label: "Services", href: `${BASE}/services`, icon: Scissors },
  { label: "Availability", href: `${BASE}/availability`, icon: Clock },
  { label: "Bookings", href: `${BASE}/bookings`, icon: CalendarDays },
  { label: "Reviews", href: `${BASE}/reviews`, icon: MessageSquare },
];

// The client side of the same account
const CLIENT: Item[] = [
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "My bookings", href: "/dashboard/bookings", icon: CalendarCheck },
];

const ACCOUNT: Item[] = [
  { label: "Account settings", href: `${BASE}/account`, icon: User },
  { label: "Log out", href: `${BASE}/logout`, icon: LogOut },
];

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

  const link = ({ label, href, icon: Icon }: Item) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(href) ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        isActive(href)
          ? "bg-white text-[#6F1D44] shadow-lg shadow-black/10"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={20} className="shrink-0" aria-hidden="true" />
      {label}
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
          <Menu size={22} aria-hidden="true" />
        </button>

        <Link
          href={BASE}
          className={`${display} text-2xl font-semibold tracking-tight text-white`}
        >
          Doka.
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/explore"
            className="hidden items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25 sm:inline-flex"
          >
            <ArrowLeftRight size={16} aria-hidden="true" />
            Switch to client
          </Link>

          <Link
            href={`${BASE}/account`}
            aria-label="Account settings"
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-1 transition hover:bg-white/10 sm:pr-4"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6E6F0] text-sm font-bold text-[#6F1D44]">
              {initials}
            </span>
            <span className="hidden max-w-40 truncate text-sm font-semibold text-white sm:block">
              {userName}
            </span>
          </Link>
        </div>
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
          <p
            className={`${display} text-3xl font-semibold tracking-tight text-white`}
          >
            Doka.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 hidden items-center gap-3 rounded-2xl bg-white/10 p-3 [@media(min-height:720px)]:flex">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F6E6F0] text-sm font-bold text-[#6F1D44]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {userName}
            </p>
            <p className="text-xs text-white/70">Provider</p>
          </div>
        </div>

        <nav className="scrollbar-none mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {MAIN.map(link)}

          <p className="mt-4 px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-white/50">
            Switch to client
          </p>
          {CLIENT.map(link)}
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