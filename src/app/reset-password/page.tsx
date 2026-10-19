import type { Metadata } from "next";
import { Suspense } from "react";
import ResetForm from "./reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <ResetForm />
    </Suspense>
  );
}