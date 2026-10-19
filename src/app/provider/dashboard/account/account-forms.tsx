"use client";

import { useActionState, useRef, useState } from "react";
import {
  btnDanger,
  btnOutline,
  btnPrimary,
  card,
  cardTitle,
  input,
} from "../ui";
import {
  changePassword,
  deleteAccount,
  updateProfile,
  type State,
} from "./actions";

const initial: State = {};
const label = "text-sm font-semibold text-[#2B0F20]";

function Message({ state }: { state: State }) {
  if (state.error)
    return (
      <p
        role="alert"
        className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
      >
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p
        role="status"
        className="rounded-2xl bg-[#F6E6F0] px-4 py-3 text-sm font-medium text-[#6B1F45]"
      >
        {state.ok}
      </p>
    );
  return null;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  return (
    <form action={action} className={`${card} space-y-5`}>
      <div>
        <h2 className={cardTitle}>Profile</h2>
        <p className="mt-1 text-sm text-[#6B4A5C]">
          This is the name clients and your dashboard show for you.
        </p>
      </div>

      <label className="block space-y-2">
        <span className={label}>Full name</span>
        <input name="name" defaultValue={name} autoComplete="name" className={input} />
      </label>

      <label className="block space-y-2">
        <span className={label}>Email</span>
        <input
          value={email}
          readOnly
          className={`${input} cursor-not-allowed bg-[#FBF3F8] text-[#6B4A5C]`}
        />
        <span className="block text-xs text-[#6B4A5C]">
          Your email is tied to how you sign in, so it can&apos;t be changed here.
        </span>
      </label>

      <Message state={state} />

      <button disabled={pending} className={`${btnPrimary} w-full sm:w-auto sm:px-10`}>
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  return (
    <form action={action} className={`${card} space-y-5`}>
      <div>
        <h2 className={cardTitle}>Password</h2>
        <p className="mt-1 text-sm text-[#6B4A5C]">
          Use at least 8 characters. Changing it signs you out of other devices.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={label}>Current password</span>
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            className={input}
          />
        </label>
        <label className="block space-y-2">
          <span className={label}>New password</span>
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            className={input}
          />
        </label>
      </div>

      <Message state={state} />

      <button disabled={pending} className={`${btnOutline} w-full sm:w-auto sm:px-10`}>
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export function DeleteAccount() {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [state, action, pending] = useActionState(deleteAccount, initial);

  function close() {
    ref.current?.close();
    setTyped("");
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-red-200 shadow-[0_16px_40px_-24px_rgba(185,28,28,0.35)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="max-w-xl">
        <h2 className="font-(family-name:--font-display) text-xl font-semibold tracking-tight text-red-600 sm:text-2xl">
          Delete account
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#6B4A5C]">
          Permanently removes your account, store and services. This can&apos;t be
          undone.
        </p>
      </div>

      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`${btnDanger} w-full sm:w-auto sm:px-8`}
      >
        Delete account
      </button>

      <dialog
        ref={ref}
        onClose={() => setTyped("")}
        className="m-auto w-[min(92vw,28rem)] rounded-3xl p-6 shadow-2xl backdrop:bg-[#2B0F20]/50 backdrop:backdrop-blur-sm sm:p-8"
      >
        <form action={action} className="space-y-4">
          <h3 className="font-(family-name:--font-display) text-2xl font-semibold tracking-tight text-[#2B0F20]">
            Delete your account?
          </h3>
          <p className="text-sm leading-relaxed text-[#6B4A5C]">
            Clients will no longer be able to find your store. Type{" "}
            <strong className="text-[#2B0F20]">DELETE</strong> to confirm.
          </p>

          <input
            name="confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className={input}
            aria-label="Type DELETE to confirm"
          />

          <Message state={state} />

          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <button type="button" onClick={close} className={btnOutline}>
              Cancel
            </button>
            <button
              disabled={pending || typed.trim() !== "DELETE"}
              className={btnDanger}
            >
              {pending ? "Deleting..." : "Delete forever"}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}