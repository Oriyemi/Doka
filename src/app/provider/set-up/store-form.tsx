"use client";

import { useActionState, useState } from "react";
import { createStore } from "./actions";

const OPTIONS = [
  { value: "in_store", label: "In store" },
  { value: "home", label: "Home service" },
  { value: "both", label: "Both" },
] as const;

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const input =
  "w-full rounded-2xl border border-[#C99AB5] bg-white px-5 py-4 text-base outline-none focus:border-[#8E2B5C]";

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
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <form action={action} className="space-y-6 rounded-3xl bg-white p-8">
        <div>
          <h1 className="text-4xl font-extrabold text-[#2B0F20]">Create your store</h1>
          <p className="mt-2 text-[#6B4A5C]">Set up once. Add your services right after.</p>
        </div>

        <label className="block space-y-2">
          <span className="font-semibold">Business name</span>
          <input
            name="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Amara Braids"
            className={input}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="font-semibold">Your store link</span>
          <div className="flex items-center rounded-2xl border border-[#C99AB5] px-5 focus-within:border-[#8E2B5C]">
            <span className="text-[#6B4A5C]">doka.app/</span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(toSlug(e.target.value));
              }}
              placeholder="your-store-name"
              className="w-full bg-transparent py-4 pl-1 outline-none"
              required
            />
          </div>
          <span className="text-sm text-[#6B4A5C]">
            Clients book you here. You can share it anywhere.
          </span>
        </label>

        <label className="block space-y-2">
          <span className="font-semibold">Location</span>
          <input
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City and area, e.g. Port Harcourt, GRA"
            className={input}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="font-semibold">Service you render</span>
          <input
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Hair, Barbing, Laundry, Makeup"
            className={input}
            required
          />
        </label>

        <div className="space-y-2">
          <span className="font-semibold">Where do you serve clients?</span>
          <div className="flex flex-wrap gap-3">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDeliveryType(o.value)}
                className={`rounded-xl px-5 py-3 ${
                  deliveryType === o.value
                    ? "bg-[#8E2B5C] text-white"
                    : "bg-[#F6E6F0] text-[#2B0F20]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="deliveryType" value={deliveryType} />
        </div>

        {state.error && <p className="text-red-600">{state.error}</p>}

        <button
          disabled={pending}
          className="w-full rounded-2xl bg-[#8E2B5C] py-4 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save and add services"}
        </button>
      </form>

      {/* Live preview */}
      <aside className="h-fit space-y-4 rounded-3xl bg-white p-8">
        <h2 className="text-xl font-bold text-[#2B0F20]">Store preview</h2>
        <p className="text-[#6B4A5C]">This is how clients will see you.</p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C99AB5] text-2xl font-extrabold text-[#7A1F4D]">
            {(name.trim()[0] ?? "A").toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#2B0F20]">{name || "[Business name]"}</p>
            <p className="text-sm text-[#6B4A5C]">
              {service || "[Service]"} · {location || "[Location]"}
            </p>
          </div>
        </div>
        <span className="inline-block rounded-lg bg-[#F6E6F0] px-3 py-1 text-sm font-medium text-[#7A1F4D]">
          Pending verification
        </span>
        <p className="text-[#6B4A5C]">doka.app/{slug || "[store-slug]"}</p>
      </aside>
    </main>
  );
}