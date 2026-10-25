"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { cancelBooking } from "./actions";

function Confirm() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-full bg-[#9B1C1C] px-4 text-xs font-semibold text-white transition hover:bg-[#7F1616] disabled:opacity-60"
    >
      {pending ? "Cancelling..." : "Yes, cancel"}
    </button>
  );
}

export default function CancelButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-9 rounded-full border-[1.5px] border-[#EBD3E0] px-4 text-xs font-semibold text-[#6B1F45] transition hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <form action={cancelBooking} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs font-medium text-[#2B0F20]">Cancel this booking?</span>
      <Confirm />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-9 rounded-full px-3 text-xs font-semibold text-[#6B4A5C] hover:text-[#2B0F20]"
      >
        Keep it
      </button>
    </form>
  );
}