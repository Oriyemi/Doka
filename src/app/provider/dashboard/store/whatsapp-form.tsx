"use client";

import { useActionState } from "react";
import { CircleCheck, MessageCircle } from "lucide-react";
import { saveWhatsapp, type WhatsappState } from "./actions";

export default function WhatsappForm({ defaultNumber }: { defaultNumber: string }) {
  const [state, action, pending] = useActionState<WhatsappState, FormData>(saveWhatsapp, {});

  return (
    <form action={action} className="space-y-3">
      <div>
        <label
          htmlFor="whatsapp"
          className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2B0F20]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          WhatsApp number
        </label>
        <p className="mb-3 text-sm text-[#6B4A5C]">
          Clients with an accepted booking can message you here to arrange the deposit.
          It is never shown on your public store page.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08012345678"
            defaultValue={state.value ?? defaultNumber}
            className="h-11 w-full min-w-0 rounded-xl border-[1.5px] border-[#E3C6D6] bg-white px-3.5 text-base text-[#2B0F20] outline-none transition focus:border-[#8E2B5C] focus:ring-4 focus:ring-[#8E2B5C]/10 sm:max-w-xs lg:text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-xl bg-[#8E2B5C] px-6 text-sm font-semibold text-white transition hover:bg-[#6F1D44] disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save number"}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-[#F6E6F0] p-3 text-sm font-medium text-[#6B1F45]">
          {state.error}
        </p>
      )}
      {state.saved && !state.error && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-[#1F6B3A]">
          <CircleCheck size={16} aria-hidden="true" />
          Saved.
        </p>
      )}
    </form>
  );
}