import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeRedirect } from "@/lib/redirect";
import { RolePicker } from "./role-picker";

type Search = Promise<{ next?: string }>;

async function OnboardingContent({ searchParams }: { searchParams: Search }) {
  const { next } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  // Finished users never see onboarding again: they go where they were headed.
  if (session.user.onboarded) redirect(safeRedirect(next));

  // Email sign-ups get their email prefix as a temporary name, so leave the
  // field empty for them. Google users already have a real name.
  const emailPrefix = session.user.email.split("@")[0];
  const defaultName = session.user.name === emailPrefix ? "" : session.user.name;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#F6E8F0] px-6 py-10 md:justify-center">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8C2B5C]/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#8C2B5C]/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col md:flex-none">
        <h1 className="text-2xl font-extrabold text-[#8C2B5C] md:text-center md:text-3xl">
          Doka<span className="text-[#8C2B5C]/60">.</span>
        </h1>

        <h2 className="mt-8 text-2xl font-extrabold text-[#2A0A1B] md:mt-10 md:text-center md:text-3xl">
          Welcome! Let&apos;s get you set up
        </h2>
        <p className="mb-6 mt-1 text-xs text-gray-600 md:mb-8 md:text-center md:text-sm">
          You can set up the rest right after this.
        </p>

        <RolePicker defaultName={defaultName} />
      </div>
    </main>
  );
}

export default function OnboardingPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F6E8F0]" />}>
      <OnboardingContent searchParams={searchParams} />
    </Suspense>
  );
}