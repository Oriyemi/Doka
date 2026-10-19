"use client";

import { useState } from "react";
import { btnPrimary } from "./ui";

export default function CopyLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked on some browsers; nothing else to do
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`${btnPrimary} w-full gap-2 sm:w-auto`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {copied ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 012-2h9" />
          </>
        )}
      </svg>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}