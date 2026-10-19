import { Suspense } from "react";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import Spinner from "@/components/spinner";
import { removeService } from "./actions";
import ServiceForm from "./service-form";

const NAIRA = new Intl.NumberFormat("en-NG");

type Service = {
  id: string;
  name: string;
  price_naira: number;
  duration_min: number;
  deposit_naira: number | null;
};

const duration = (m: number) =>
  m % 60 === 0
    ? `${m / 60} hr${m === 60 ? "" : "s"}`
    : m > 60
      ? `${Math.floor(m / 60)} hr ${m % 60} min`
      : `${m} min`;

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2B0F20]">
          Services
        </h1>
        <p className="mt-1 text-sm text-[#6B4A5C]">
          Add what clients can book. You can add as many as you like.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ServiceForm />

        <section className="space-y-4 rounded-3xl bg-white p-7 shadow-xl shadow-primary/5">
          <div>
            <h2 className="text-xl font-bold text-[#2B0F20]">Your services</h2>
            <p className="mt-1 text-sm text-[#6B4A5C]">
              Shown on your store page and in Explore.
            </p>
          </div>

          <Suspense
            fallback={
              <Spinner fullScreen={false} label="Loading services..." />
            }
          >
            <ServicesList />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function ServicesList() {
  const store = await getProviderStore();
  const { rows } = await db.query<Service>(
    `SELECT id, name, price_naira, duration_min, deposit_naira
     FROM service WHERE store_id = $1 AND active ORDER BY created_at`,
    [store.id],
  );

  if (rows.length === 0) {
    return <p className="text-[#6B4A5C]">No services yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((s) => (
        <div
          key={s.id}
          className="flex items-start justify-between gap-4 rounded-2xl border border-[#C99AB5] p-4"
        >
          <div className="min-w-0">
            <p className="wrap-break-words font-bold text-[#2B0F20]">
              {s.name}
            </p>
            <p className="text-sm text-[#6B4A5C]">
              {duration(s.duration_min)} ·{" "}
              {s.deposit_naira
                ? `₦${NAIRA.format(s.deposit_naira)} deposit`
                : "No deposit"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="font-bold text-[#2B0F20]">
              ₦{NAIRA.format(s.price_naira)}
            </p>
            <form action={removeService}>
              <input type="hidden" name="id" value={s.id} />
              <button className="inline-flex items-center gap-1 text-sm text-[#6B4A5C] underline hover:text-primary">
                <Trash2 size={14} aria-hidden="true" />
                Remove
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}