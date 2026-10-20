"use client";

import { useState, useTransition } from "react";
import { CalendarCheck, LoaderCircle, Store } from "lucide-react";
import { RoleCard } from "@/components/role-card";
import { completeOnboarding } from "./actions";

type Choice = "provider" | "customer";

export function RolePicker({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ready = !!choice && name.trim().length >= 2;

  function handleContinue() {
    if (!choice || !ready) return;
    setError(null);
    startTransition(async () => {
      // On success the action redirects, so it only returns when there is an error.
      const res = await completeOnboarding(choice, name);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-1 flex-col md:flex-none">
      <div className="mx-auto mb-6 w-full max-w-sm md:mb-8">
        <label
          htmlFor="full-name"
          className="mb-1 block text-xs font-semibold text-[#2A0A1B]"
        >
          Your full name
        </label>
        <input
          id="full-name"
          type="text"
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amaka Obi"
          className="w-full rounded-xl border border-[#D9A3BD] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#8C2B5C]"
        />
        <p className="mt-1 text-xs text-gray-600">
          This is the name clients and providers will see.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="How will you use Doka?"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5"
      >
        <RoleCard
          icon={Store}
          title="I want to take bookings"
          description="Business."
          selected={choice === "provider"}
          onSelect={() => setChoice("provider")}
        />
        <RoleCard
          icon={CalendarCheck}
          title="I want to book a service"
          description="Customer."
          selected={choice === "customer"}
          onSelect={() => setChoice("customer")}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-auto pt-8 md:mt-8 md:flex md:justify-center">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!ready || pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C2B5C] py-3 text-sm font-semibold text-white transition hover:bg-[#701E47] disabled:opacity-50 md:w-56"
        >
          {pending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              Continuing...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}