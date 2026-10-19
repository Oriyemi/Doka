import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PageHeader from "../page-header";
import { display } from "../ui";
import { DeleteAccount, PasswordForm, ProfileForm } from "./account-forms";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { name, email } = session.user;
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "D";

  return (
    <div className="max-w-3xl space-y-6 sm:space-y-8">
      <PageHeader
        title="Account settings"
        subtitle="Your personal details and sign-in. Business details live under Store."
      />

      <div className="flex items-center gap-4 rounded-3xl bg-[#6F1D44] p-5 text-white shadow-[0_16px_40px_-18px_rgba(111,29,68,0.7)] sm:gap-5 sm:p-7">
        <span
          className={`${display} flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F6E6F0] text-2xl font-semibold text-[#6F1D44] sm:h-20 sm:w-20 sm:text-3xl`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className={`${display} truncate text-xl font-semibold sm:text-2xl`}>
            {name}
          </p>
          <p className="truncate text-sm text-white/80">{email}</p>
          <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Provider
          </span>
        </div>
      </div>

      <ProfileForm name={name} email={email} />
      <PasswordForm />
      <DeleteAccount />
    </div>
  );
}