"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { createBooking, type BookingState } from "./actions";

// text-base on phones stops iOS zooming into a field; smaller from lg up
const input =
  "w-full rounded-xl border-[1.5px] border-[#E3C6D6] bg-white px-3.5 text-base text-[#2B0F20] outline-none transition focus:border-[#8c2d53] focus:ring-4 focus:ring-[#8c2d53]/10 lg:text-sm";
const label = "mb-1.5 block text-sm font-semibold text-[#2B0F20]";

export default function BookingForm({
  serviceId,
  slot,
  deliveryType,
  defaultName,
}: {
  serviceId: string;
  slot: string;
  deliveryType: string; // "in_store" | "home" | "both"
  defaultName: string;
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});
  const v = state.values;
  const needsAddress = deliveryType !== "in_store";

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="slot" value={slot} />

      <div>
        <label htmlFor="name" className={label}>Full name</label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={v?.name ?? defaultName}
          className={`${input} h-11`}
        />
      </div>

      <div>
        <label htmlFor="phone" className={label}>Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="Enter phone number"
          defaultValue={v?.phone}
          className={`${input} h-11`}
        />
      </div>

      {deliveryType === "both" && (
        <fieldset className="sm:col-span-2">
          <legend className={label}>Where should it happen?</legend>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <label className="flex min-h-10 items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="place"
                value="store"
                defaultChecked={v?.place !== "home"}
                className="h-4 w-4 accent-primary"
              />
              At the provider&apos;s store
            </label>
            <label className="flex min-h-10 items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="place"
                value="home"
                defaultChecked={v?.place === "home"}
                className="h-4 w-4 accent-primary"
              />
              At my location
            </label>
          </div>
        </fieldset>
      )}

      {needsAddress && (
        <div className="sm:col-span-2">
          <label htmlFor="address" className={label}>
            Address{deliveryType === "both" ? " (home service only)" : ""}
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            autoComplete="street-address"
            defaultValue={v?.address}
            className={`${input} py-3`}
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="note" className={label}>
          Note for the provider <span className="font-normal text-[#6B4A5C]">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={300}
          defaultValue={v?.note}
          className={`${input} py-3`}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-[#F6E6F0] p-3.5 text-sm font-medium text-[#6B1F45] sm:col-span-2"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-[#6B4A5C] sm:text-left sm:text-sm">
          The provider will accept or decline. We&apos;ll email you either way.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 sm:w-auto sm:min-w-60"
        >
          {pending ? "Sending..." : "Request booking"}
          {!pending && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}