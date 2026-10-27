
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export type NavUser = { name: string; isProvider: boolean };

// user: undefined = not known (loading, or the check failed), null = signed out
export default function NavbarView({
  user,
}: {
  user: NavUser | null | undefined;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const switchRef = useRef<HTMLDivElement>(null);

  async function signOut() {
    await authClient.signOut();
    // A full reload so every server component sees that the session is gone
    window.location.href = "/sign-in";
  }

  const inProvider = pathname.startsWith("/provider");

  // Close the Switch account menu on outside click or Escape
  useEffect(() => {
    if (!switchOpen) return;

    const onDown = (e: MouseEvent) => {
      if (!switchRef.current?.contains(e.target as Node)) {
        setSwitchOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSwitchOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [switchOpen]);

  const links = [
    {
      href: "/explore",
      label: "Explore",
      active: pathname.startsWith("/explore"),
    },
  ];

  if (user && !user.isProvider) {
    links.push(
      {
        href: "/dashboard/bookings",
        label: "My Bookings",
        active: pathname.startsWith("/dashboard"),
      },
      {
        href: "/provider/set-up",
        label: "Become a provider",
        active: pathname.startsWith("/provider/set-up"),
      },
    );
  }

  if (user?.isProvider) {
    links.push({
      href: "/provider/dashboard",
      label: "Dashboard",
      active: inProvider,
    });
  }

  const switchItems = user
    ? [
        {
          label: "Client",
          hint: "Explore services and your bookings",
          href: "/explore",
          current: !inProvider,
        },
        user.isProvider
          ? {
              label: "Provider",
              hint: "Your store and bookings dashboard",
              href: "/provider/dashboard",
              current: inProvider,
            }
          : {
              label: "Become a provider",
              hint: "Set up your store and take bookings",
              href: "/provider/set-up",
              current: false,
            },
        ...(user.isProvider
          ? [
              {
                label: "My bookings",
                hint: "Services you booked as a client",
                href: "/dashboard/bookings",
                current: false,
              },
            ]
          : []),
      ]
    : [];

  const linkCls = (active: boolean) =>
    `text-sm transition hover:text-white ${
      active ? "font-bold text-white" : "text-white/70"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-[#701E47] text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href={user ? "/explore" : "/"}
          className="text-2xl font-extrabold text-white"
        >
          Doka<span className="text-[#8C2B5C]/60">.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={linkCls(l.active)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {user === null && (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#701E47] transition hover:bg-white/90"
              >
                Get started
              </Link>
            </>
          )}

          {user && (
            <div ref={switchRef} className="relative">
              <button
                type="button"
                onClick={() => setSwitchOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={switchOpen}
                className="flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-medium transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Switch account
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform ${
                    switchOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {switchOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white p-2 text-[#2B0F20] shadow-xl ring-1 ring-black/5"
                >
                  <p className="truncate px-3 pb-2 pt-1 text-xs text-[#6B4A5C]">
                    Signed in as{" "}
                    <span className="font-semibold text-[#2B0F20]">
                      {user.name}
                    </span>
                  </p>

                  {switchItems.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setSwitchOpen(false)}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#F6E6F0]"
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="block text-xs text-[#6B4A5C]">
                          {item.hint}
                        </span>
                      </span>

                      {item.current && (
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-[#8E2B5C]"
                          aria-label="Current"
                        />
                      )}
                    </Link>
                  ))}

                  <div className="my-1 border-t border-[#F3E7EE]" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#9B1C1C] transition hover:bg-[#FDECEC]"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="ml-auto rounded-lg border border-white/20 p-2 transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                aria-current={l.active ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-sm transition hover:bg-white/10 ${
                  l.active ? "font-bold" : "text-white/80"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {user === null && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-white/25 px-4 py-3 text-center text-sm font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-white px-4 py-3 text-center text-sm font-bold text-[#701E47]"
                >
                  Get started
                </Link>
              </div>
            )}

            {user && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="px-3 pb-1 text-xs uppercase tracking-wider text-white/50">
                  Switch account
                </p>

                {switchItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-sm transition hover:bg-white/10"
                  >
                    <span>{item.label}</span>
                    {item.current && <Check size={16} aria-label="Current" />}
                  </Link>
                ))}

                {/* Mobile sign out */}
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
