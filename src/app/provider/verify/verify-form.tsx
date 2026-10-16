"use client";

import Link from "next/link";
import { useActionState } from "react";
import { uploadId } from "./actions";

export default function VerifyForm() {
  const [state, action, pending] = useActionState(uploadId, {});

  return (
    <main className="mx-auto max-w-xl p-8">
      <form action={action} className="space-y-5 rounded-3xl bg-white p-8">
        <h1 className="text-3xl font-extrabold text-[#2B0F20]">Verify your store</h1>
        <p className="text-[#6B4A5C]">
          Upload a clear photo of a government ID (voter's card, driver's licence,
          NIN slip or passport). The name on it must match your account name. It is
          only used to verify you and is never shown to clients.
        </p>

        <input
          type="file"
          name="idImage"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block w-full rounded-2xl border border-[#C99AB5] p-4"
        />

        {state.error && <p className="text-red-600">{state.error}</p>}

        <button
          disabled={pending}
          className="w-full rounded-2xl bg-[#8E2B5C] py-4 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload ID"}
        </button>

        <Link href="/provider/dashboard" className="block text-center text-[#6B4A5C] underline">
          Skip for now
        </Link>
      </form>
    </main>
  );
}
