"use client";

import { useRef, useState } from "react";
import { CircleAlert, LoaderCircle, Trash2, Upload } from "lucide-react";
import { btnOutline } from "../ui";
import { removeLogo, uploadLogo } from "./actions";

export default function LogoForm({ hasLogo }: { hasLogo: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    // Quick check in the browser; the server checks again
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      input.value = "";
      return;
    }

    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("logo", file);
    const res = await uploadLogo(fd);
    setPending(false);
    input.value = "";
    if (res.error) setError(res.error);
  }

  async function onRemove() {
    setPending(true);
    setError(null);
    await removeLogo();
    setPending(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onPick}
          className="hidden"
          aria-label="Upload store logo"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className={`${btnOutline} inline-flex min-h-11 items-center gap-2 px-5`}
        >
          {pending ? (
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {hasLogo ? "Change logo" : "Upload logo"}
        </button>

        {hasLogo && (
          <button
            type="button"
            disabled={pending}
            onClick={onRemove}
            className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-[#6B4A5C] underline underline-offset-4 hover:text-[#8E2B5C]"
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-[#6B4A5C]">
        PNG, JPG or WebP, up to 2 MB. Square images look best.
      </p>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm font-medium text-red-600"
        >
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}