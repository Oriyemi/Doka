import { Suspense } from "react";
import Spinner from "@/components/spinner";
import AuthGate from "./auth-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
      <Suspense fallback={<Spinner label="Loading dashboard..." />}>
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </div>
  );
}