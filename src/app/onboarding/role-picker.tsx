"use client";

import { useState, useTransition } from "react";
import { CalendarCheck, Store } from "lucide-react";
import { RoleCard } from "@/components/role-card";
import { completeOnboarding } from "./actions";

type Choice = "provider" | "customer";

export function RolePicker() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [pending, startTransition] = useTransition();

  function handleContinue() {
    if (!choice) return;
    startTransition(async () => {
      await completeOnboarding(choice);
    });
  }

  return (
    <div className="flex flex-1 flex-col md:flex-none">
      <div
        role="radiogroup"
        aria-label="How will you use Doka?"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5"
      >
        <RoleCard
          icon={Store}
          title="I want to take bookings"
          description="Open your store, list services and manage bookings."
          selected={choice === "provider"}
          onSelect={() => setChoice("provider")}
        />
        <RoleCard
          icon={CalendarCheck}
          title="I want to book a service"
          description="Find providers and book in a few clicks."
          selected={choice === "customer"}
          onSelect={() => setChoice("customer")}
        />
      </div>

      <div className="mt-auto pt-8 md:mt-8 md:flex md:justify-center">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!choice || pending}
          className="w-full rounded-xl bg-[#8C2B5C] py-3 text-sm font-semibold text-white transition hover:bg-[#701E47] disabled:opacity-50 md:w-56"
        >
          {pending ? "Continuing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}