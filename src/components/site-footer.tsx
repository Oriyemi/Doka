import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#EBD3E0] bg-white px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#6B4A5C] sm:flex-row">
        <p>© {new Date().getFullYear()} Doka. All rights reserved.</p>
        <nav aria-label="Legal" className="flex gap-6 font-semibold">
          <Link href="/privacy" className="hover:text-[#8E2B5C]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#8E2B5C]">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}