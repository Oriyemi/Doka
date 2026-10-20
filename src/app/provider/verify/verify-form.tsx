"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Upload,
  Lock,
  X,
  ArrowRight,
  FileImage,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { uploadId } from "./actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const ID_TYPES = ["Voter's card", "Driver's licence", "NIN slip", "Passport"];
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // keep in sync with MAX_BYTES in actions.ts

const RULES = [
  { icon: Eye, text: "All four corners and every word are visible" },
  { icon: EyeOff, text: "No glare, blur or cropped edges" },
  { icon: ShieldCheck, text: "The name matches the full name you enter above" },
];

const wrap =
  "flex items-center gap-3 rounded-2xl border border-[#E4C7D6] bg-[#FDF8FB] px-5 transition focus-within:border-[#8c2d53] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8c2d53]/10";
const bare =
  "w-full bg-transparent py-4 text-base text-[#2B0F20] outline-none placeholder:text-[#B796A8]";
const iconCls = "h-[18px] w-[18px] shrink-0 text-[#8c2d53]";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Shrinks a phone photo before upload so the request stays under the
// Next.js / Vercel body limits. Falls back to the original file on any failure.
async function compress(
  file: File,
  maxSide = 1800,
  quality = 0.8,
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    // Only use the compressed version if it is actually smaller
    if (blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

export default function VerifyForm() {
  const [state, action, pending] = useActionState(uploadId, {});

  const inputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Build and clean up the preview URL for the chosen image
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function pick(files: FileList | null) {
    const raw = files?.[0];
    if (!raw) return;

    if (!ACCEPTED.includes(raw.type)) {
      setLocalError("Use a JPG, PNG or WebP photo of your ID.");
      return;
    }

    setCompressing(true);
    const next = await compress(raw);
    setCompressing(false);

    if (next.size > MAX_UPLOAD_BYTES) {
      setLocalError("That photo is too large. Try a smaller one.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLocalError(null);
    setFile(next);

    // Keep the real input in sync so the compressed file is what gets submitted
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(next);
      inputRef.current.files = dt.files;
    }
  }

  function clear() {
    setFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Submit manually instead of using action={action}.
  // React 19 resets the form after an action runs, which would clear the file
  // input while our preview still showed the photo.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (compressing) return;

    if (!fullName.trim()) {
      setLocalError("Enter your full name as it appears on your ID.");
      return;
    }
    if (!file) {
      setLocalError("Choose a photo of your ID first.");
      return;
    }

    setLocalError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }

  const error = localError ?? state.error;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6E6F0]">
      {/* page-level motif: edge circles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/10" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10" />
        <div className="absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-primary/10" />
        <div className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full border border-primary/20" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-10 sm:px-6 lg:py-14">
        <p className="mb-6 text-center text-3xl font-extrabold tracking-tight text-[#4A1230]">
          Doka<span className="text-primary">.</span>
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="relative space-y-7 overflow-hidden rounded-4xl bg-white p-7 shadow-xl shadow-primary/10 sm:p-10"
        >
          {/* corner motif on the card */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F6E6F0]" />
          <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#EBC9DB]" />

          <div className="relative">
            <span className="inline-block rounded-full bg-[#F6E6F0] px-3 py-1 text-xs font-semibold text-primary">
              Step 2 · Verification
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#2B0F20]">
              Verify your store
            </h1>
            <p className="mt-2 text-[#6B4A5C]">
              Upload a clear photo of a government ID so clients can trust your store.
            </p>
          </div>

          {/* full name, compared against the name on the ID */}
          <label className="relative block space-y-2">
            <span className="text-sm font-semibold text-[#2B0F20]">Full name</span>
            <div className={wrap}>
              <User className={iconCls} />
              <input
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amara Chioma Okafor"
                autoComplete="name"
                className={bare}
              />
            </div>
            <span className="block text-sm text-[#6B4A5C]">
              Enter your name exactly as it is written on your ID.
            </span>
          </label>

          {/* accepted ID types */}
          <div className="relative space-y-3">
            <span className="text-sm font-semibold text-[#2B0F20]">Accepted IDs</span>
            <div className="flex flex-wrap gap-2">
              {ID_TYPES.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#E4C7D6] bg-[#FDF8FB] px-3.5 py-1.5 text-sm font-medium text-[#2B0F20]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* upload area */}
          <div className="relative space-y-3">
            <span className="text-sm font-semibold text-[#2B0F20]">Photo of your ID</span>

            <input
              ref={inputRef}
              id="idImage"
              type="file"
              name="idImage"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pick(e.target.files)}
              className="sr-only"
            />

            {!file ? (
              <label
                htmlFor="idImage"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pick(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition focus-within:ring-4 focus-within:ring-primary/10 ${
                  dragging
                    ? "border-primary bg-[#F6E6F0]"
                    : "border-[#E4C7D6] bg-[#FDF8FB] hover:border-primary/50"
                }`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F6E6F0] text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <span className="font-semibold text-[#2B0F20]">
                  {compressing
                    ? "Preparing your photo..."
                    : "Tap to choose a photo, or drop it here"}
                </span>
                <span className="text-sm text-[#6B4A5C]">JPG, PNG or WebP</span>
              </label>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-[#FDF8FB] p-3">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#F6E6F0]">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview of your ID" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-[#2B0F20]">
                    <FileImage className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{file.name}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-[#6B4A5C]">{formatSize(file.size)}</p>
                  <label
                    htmlFor="idImage"
                    className="mt-1 inline-block cursor-pointer text-sm font-semibold text-primary underline underline-offset-2"
                  >
                    Choose a different photo
                  </label>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Remove photo"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6B4A5C] transition hover:bg-[#F6E6F0] hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* photo checklist */}
          <ul className="relative space-y-2.5 rounded-2xl bg-[#FDF8FB] p-5">
            {RULES.map((r) => (
              <li key={r.text} className="flex items-center gap-3 text-sm text-[#2B0F20]">
                <r.icon className="h-4.5 w-4.5 shrink-0 text-primary" />
                {r.text}
              </li>
            ))}
          </ul>

          {/* privacy note */}
          <p className="relative flex items-start gap-3 text-sm text-[#6B4A5C]">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Your ID is only used to verify you. It is never shown to clients.
          </p>

          {error && (
            <p role="alert" className="relative rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="relative space-y-4">
            <button
              disabled={pending || compressing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-[#7a2548] active:scale-[0.99] disabled:opacity-60"
            >
              {pending ? (
                "Verifying..."
              ) : compressing ? (
                "Preparing photo..."
              ) : (
                <>
                  Upload ID <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>

            <Link
              href="/provider/dashboard"
              className="block text-center text-sm font-medium text-[#6B4A5C] underline underline-offset-2 transition hover:text-primary"
            >
              Skip for now
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}