import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardShell from "./dashboard-shell";

export default async function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <DashboardShell userName={session.user.name}>{children}</DashboardShell>
  );
}