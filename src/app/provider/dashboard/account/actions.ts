"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProviderStore } from "@/lib/provider";

export type State = { error?: string; ok?: string };

export async function updateProfile(_: State, fd: FormData): Promise<State> {
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) {
    return { error: "Enter your full name." };
  }
  try {
    await auth.api.updateUser({ headers: await headers(), body: { name } });
  } catch {
    return { error: "Couldn't save your name. Try again." };
  }
  revalidatePath("/provider/dashboard", "layout");
  return { ok: "Profile saved." };
}

export async function changePassword(_: State, fd: FormData): Promise<State> {
  const currentPassword = String(fd.get("current") ?? "");
  const newPassword = String(fd.get("next") ?? "");
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
  } catch {
    return {
      error:
        "Current password is wrong, or this account signs in with Google only.",
    };
  }
  return { ok: "Password updated." };
}

export async function deleteAccount(_: State, fd: FormData): Promise<State> {
  if (String(fd.get("confirm") ?? "").trim() !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Don't leave clients stranded with open bookings
  const store = await getProviderStore();
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM booking
     WHERE store_id = $1 AND (status = 'pending' OR (status = 'accepted' AND end_at > now()))`,
    [store.id],
  );
  if (rows[0].n > 0) {
    return {
      error: `You have ${rows[0].n} pending or upcoming booking${rows[0].n === 1 ? "" : "s"}. Finish or decline them first.`,
    };
  }

  // Sessions and linked accounts go with the user (ON DELETE CASCADE)
  await db.query('DELETE FROM "user" WHERE id = $1', [session.user.id]);
  redirect("/");
}