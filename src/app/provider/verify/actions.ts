"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export type VerifyState = { error?: string };

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadId(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/onboarding");

  const file = formData.get("idImage");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Choose a photo of your ID." };

  const ext = TYPES[file.type];
  if (!ext) return { error: "Use a JPG, PNG or WebP photo." };
  if (file.size > MAX_BYTES)
    return { error: "Photo is too large. Use one under 4 MB." };

  const { rows } = await db.query(
    "SELECT id, id_image_path FROM store WHERE owner_id = $1",
    [session.user.id],
  );
  const store = rows[0];
  if (!store) redirect("/provider/set-up");

  // Path starts with the user id so each provider's files stay separate
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("id-cards")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
    });

  if (error) {
    console.error("[uploadId]", error);
    return { error: "Upload failed. Try again." };
  }

  await db.query(
    "UPDATE store SET id_image_path = $1, verification_status = 'pending' WHERE id = $2",
    [path, store.id],
  );

  // Remove the previous photo if they are re-uploading
  if (store.id_image_path) {
    await supabase.storage.from("id-cards").remove([store.id_image_path]);
  }

  redirect("/provider/dashboard");
}