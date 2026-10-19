"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Plus } from "lucide-react";
import { btnPrimary, card, cardTitle, input } from "../ui";
import { addService } from "./actions";

const OPTIONS = [
  ["in_store", "In store"],
  ["home", "Home service"],
  ["both", "Both"],
] as const;

const label = "text-sm font-semibold text-[#2B0F20]";

export default function ServiceForm() {
  const [delivery, setDelivery] = useState("in_store");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setSuccess(false);
    setError(null);
    const res = await addService(new FormData(form));
    setPending(false);

    if (res.error) {
      setError(res.error); // keep what they typed
    } else {
      setSuccess(true);
      form.reset();
      setDelivery("in_store");
      setTimeout(() => setSuccess(false), 2500);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${card} space-y-5`}>
      <div>
        <h2 className={cardTitle}>Add a service</h2>
        <p className="mt-1 text-sm text-[#6B4A5C]">
          Clients pick from these when they book you.
        </p>
      </div>

      <label className="block space-y-2">
        <span className={label}>Service name</span>
        <input name="name" placeholder="e.g. Knotless braids" className={input} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={label}>Price (₦)</span>
          <input
            name="price"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="0"
            className={input}
          />
        </label>
        <label className="block space-y-2">
          <span className={label}>Duration (minutes)</span>
          <input
            name="duration"
            type="number"
            inputMode="numeric"
            min="15"
            step="15"
            placeholder="e.g. 120"
            className={input}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className={label}>Deposit (₦, optional)</span>
        <input
          name="deposit"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Leave empty for no deposit"
          className={input}
        />
      </label>

      <div className="space-y-2">
        <span className={label}>Available as</span>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#F6E6F0] p-1">
          {OPTIONS.map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={delivery === value}
              onClick={() => setDelivery(value)}
              className={`min-h-11 rounded-xl px-2 text-xs font-semibold transition sm:text-sm ${
                delivery === value
                  ? "bg-[#8E2B5C] text-white shadow-md shadow-[#8E2B5C]/25"
                  : "text-[#4A3340] hover:bg-white/70"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        <input type="hidden" name="delivery" value={delivery} />
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
        >
          <CircleAlert size={16} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-[#F6E6F0] px-4 py-3 text-sm font-medium text-[#6B1F45]"
        >
          <CircleCheck size={16} className="shrink-0" aria-hidden="true" />
          Service added.
        </p>
      )}

      <button
        disabled={pending}
        className={`${btnPrimary} inline-flex w-full items-center justify-center gap-2`}
      >
        {pending ? (
          <>
            <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
            Adding...
          </>
        ) : (
          <>
            <Plus size={18} aria-hidden="true" />
            Add service
          </>
        )}
      </button>
    </form>
  );
}