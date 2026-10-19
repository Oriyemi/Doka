import Link from "next/link";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#FBF3F8] px-6 py-12">
      <article className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#EBD3E0]/70 sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#8E2B5C]">
          ← Doka
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2B0F20]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#6B4A5C]">Last updated: {updated}</p>
        <div className="mt-8 space-y-4 leading-relaxed text-[#2B0F20] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </main>
  );
}