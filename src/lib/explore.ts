import { db } from "@/lib/db";
import type { Store } from "@/lib/provider";

export type ExploreStore = {
  id: string;
  name: string;
  slug: string;
  location: string;
  delivery_type: Store["delivery_type"];
  logo_url: string | null;
  service_count: number;
  from_price: number;
};

export async function getExploreStores(q?: string, type?: string) {
  const params: string[] = [];
  let where = `s.verification_status = 'verified'`;

  if (q?.trim()) {
    params.push(`%${q.trim()}%`);
    where += ` AND (s.name ILIKE $${params.length}
                 OR s.location ILIKE $${params.length}
                 OR s.service ILIKE $${params.length})`;
  }
  if (type === "in_store" || type === "home") {
    params.push(type);
    where += ` AND (s.delivery_type = $${params.length} OR s.delivery_type = 'both')`;
  }

  const { rows } = await db.query<ExploreStore>(
    `SELECT s.id, s.name, s.slug, s.location, s.delivery_type, s.logo_url,
            COUNT(sv.id)::int AS service_count,
            MIN(sv.price_naira)::int AS from_price
     FROM store s
     JOIN service sv ON sv.store_id = s.id AND sv.active
     WHERE ${where}
     GROUP BY s.id
     ORDER BY s.name`,
    params,
  );
  return rows;
}