"use client";

import { useActionState, useState } from "react";
import {
  Store,
  House,
  Sparkles,
  ArrowRight,
  Link2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { createStore } from "./actions";

const OPTIONS = [
  { value: "in_store", label: "In store", hint: "Clients come to you", icon: Store },
  { value: "home", label: "Home service", hint: "You go to clients", icon: House },
  { value: "both", label: "Both", hint: "Flexible", icon: Sparkles },
] as const;

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const wrap =
  "flex items-center gap-3 rounded-2xl border border-[#E4C7D6] bg-[#FDF8FB] px-5 transition focus-within:border-[#8c2d53] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8c2d53]/10";
const bare =
  "w-full bg-transparent py-4 text-base text-[#2B0F20] outline-none placeholder:text-[#B796A8]";
const icon = "h-[18px] w-[18px] shrink-0 text-[#8c2d53]";

export default function StoreForm() {
  const [state, action, pending] = useActionState(createStore, {});

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [deliveryType, setDeliveryType] = useState<string>("in_store");

  function onNameChange(value: string) {
    setName(value);
    // Fill the link from the name until the user edits the link themselves
    if (!slugEdited) setSlug(toSlug(value));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6E6F0]">
      {/* page-level motif: edge circles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/10" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10" />
        <div className="absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-primary/10" />
        <div className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full border border-primary/20" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-10 sm:px-6 lg:py-14">
        <p className="mb-6 text-center text-3xl font-extrabold tracking-tight text-[#4A1230]">
          Doka<span className="text-primary">.</span>
        </p>

        <form
          action={action}
          className="relative space-y-7 overflow-hidden rounded-4xl bg-white p-7 shadow-xl shadow-primary/10 sm:p-10"
        >
          {/* corner motif on the card */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F6E6F0]" />
          <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#EBC9DB]" />

          <div className="relative">
            <span className="inline-block rounded-full bg-[#F6E6F0] px-3 py-1 text-xs font-semibold text-primary">
              Step 1 · Store details
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#2B0F20]">
              Create your store
            </h1>
            <p className="mt-2 text-[#6B4A5C]">Set up once. Add your services right after.</p>
          </div>

          <label className="relative block space-y-2">
            <span className="text-sm font-semibold text-[#2B0F20]">Business name</span>
            <div className={wrap}>
              <Store className={icon} />
              <input
                name="name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Amara Braids"
                className={bare}
                required
              />
            </div>
          </label>

          <label className="relative block space-y-2">
            <span className="text-sm font-semibold text-[#2B0F20]">Your store link</span>
            <div className={wrap}>
              <Link2 className={icon} />
              <span className="font-medium text-primary">doka.app/</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(toSlug(e.target.value));
                }}
                placeholder="your-store-name"
                className={`${bare} -ml-2`}
                required
              />
            </div>
            <span className="block text-sm text-[#6B4A5C]">
              Clients book you here. You can share it anywhere.
            </span>
          </label>

          <div className="relative grid gap-6 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#2B0F20]">Location</span>
              <div className={wrap}>
                <MapPin className={icon} />
                <input
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Port Harcourt, GRA"
                  className={bare}
                  required
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#2B0F20]">Service you render</span>
              <div className={wrap}>
                <Briefcase className={icon} />
                <input
                  name="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Hair, Barbing, Laundry"
                  className={bare}
                  required
                />
              </div>
            </label>
          </div>

          <div className="relative space-y-3">
            <span className="text-sm font-semibold text-[#2B0F20]">
              Where do you serve clients?
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {OPTIONS.map((o) => {
                const active = deliveryType === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setDeliveryType(o.value)}
                    aria-pressed={active}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      active
                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                        : "border-[#E4C7D6] bg-[#FDF8FB] text-[#2B0F20] hover:border-primary/50"
                    }`}
                  >
                    <o.icon className="h-5 w-5" />
                    <span className="mt-2 block font-semibold">{o.label}</span>
                    <span className={`block text-xs ${active ? "text-white/80" : "text-[#6B4A5C]"}`}>
                      {o.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="deliveryType" value={deliveryType} />
          </div>

          {state.error && (
            <p className="relative rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <button
            disabled={pending}
            className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-[#7a2548] active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? (
              "Saving..." 
            ) : (
              <>
                Save and add services <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

// preview