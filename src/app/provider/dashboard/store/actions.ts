"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { toWhatsAppNumber } from "@/lib/whatsapp";

export type LogoState = { error?: string };

const BUCKET = "store-logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function refresh(slug: string) {
  revalidatePath("/provider/dashboard/store");
  revalidatePath("/explore");
  revalidatePath(`/${slug}`);
}

export async function uploadLogo(fd: FormData): Promise<LogoState> {
  const store = await getProviderStore();
  const file = fd.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image first." };
  }
  const ext = TYPES[file.type];
  if (!ext) return { error: "Use a PNG, JPG or WebP image." };
  if (file.size > MAX_BYTES) return { error: "Image must be under 2 MB." };

  // New file name each time so browsers never show a stale cached logo
  const path = `${store.id}/${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) {
    console.error("Logo upload failed:", error);
    return { error: "Upload failed. Try again." };
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  // Delete the previous logo file, if there was one
  if (store.logo_url) {
    const old = store.logo_url.split(`/${BUCKET}/`)[1];
    if (old) await supabaseAdmin.storage.from(BUCKET).remove([old]);
  }

  await db.query(`UPDATE store SET logo_url = $1 WHERE id = $2`, [
    data.publicUrl,
    store.id,
  ]);

  refresh(store.slug);
  return {};
}

export async function removeLogo() {
  const store = await getProviderStore();
  if (!store.logo_url) return;

  const old = store.logo_url.split(`/${BUCKET}/`)[1];
  if (old) await supabaseAdmin.storage.from(BUCKET).remove([old]);

  await db.query(`UPDATE store SET logo_url = NULL WHERE id = $1`, [store.id]);

  refresh(store.slug);
}
export type WhatsappState = { error?: string; saved?: boolean; value?: string };

export async function saveWhatsapp(
  _prev: WhatsappState,
  fd: FormData,
): Promise<WhatsappState> {
  const store = await getProviderStore(); // also proves who is calling
  const raw = String(fd.get("whatsapp") ?? "").trim();

  // An empty field removes the number
  if (raw === "") {
    await db.query(`UPDATE store SET whatsapp_number = NULL WHERE id = $1`, [store.id]);
    revalidatePath("/provider/dashboard/store");
    return { saved: true };
  }

  const number = toWhatsAppNumber(raw);
  if (!number) {
    return { error: "Enter a valid Nigerian mobile number, like 08012345678.", value: raw };
  }

  await db.query(`UPDATE store SET whatsapp_number = $1 WHERE id = $2`, [number, store.id]);
  revalidatePath("/provider/dashboard/store");
  return { saved: true };
}