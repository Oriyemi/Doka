// This page verifies Doka providers by checking their login, validating their ID photo (JPG, PNG, or WebP under 4 MB), and uploading it to Supabase Storage. It saves the image path in PostgreSQL, marks verification as pending, and attempts to clean up uploaded or previous files when needed. The id-cards bucket is private, helping protect sensitive ID photos from public access.
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

  // The id-cards bucket must be private in Supabase Storage.
  // Do not create or use public URLs for identity documents.
  const { error } = await supabase.storage
    .from("id-cards")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
    });

  if (error) {
    console.error("[uploadId]", error);
    return { error: "Upload failed. Try again." };
  }

  // If saving the path to PostgreSQL fails, remove the new upload
  // so the file is not left behind without a database record.
  try {
    await db.query(
      "UPDATE store SET id_image_path = $1, verification_status = 'pending' WHERE id = $2",
      [path, store.id],
    );
  } catch (dbError) {
    console.error("[uploadId] Database update failed:", dbError);

    const { error: cleanupError } = await supabase.storage
      .from("id-cards")
      .remove([path]);

    if (cleanupError) {
      console.error("[uploadId] Failed to remove uploaded photo:", cleanupError);
    }

    return { error: "Could not save your ID photo. Please try again." };
  }

  // Remove the previous photo if they are re-uploading
  if (store.id_image_path) {
    const { error: removeError } = await supabase.storage
      .from("id-cards")
      .remove([store.id_image_path]);

    if (removeError) {
      console.error("[uploadId] Failed to remove previous photo:", removeError);
    }
  }

  redirect("/provider/dashboard");
}