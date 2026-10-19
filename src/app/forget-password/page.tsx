import type { Metadata } from "next";
import ForgotForm from "./forget-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}