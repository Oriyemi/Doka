import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph, small } from "../components/theme";

export type ResetPasswordEmailProps = {
  name: string;
  // Better Auth builds this link. It carries the one-time reset token.
  resetUrl: string;
};

// To: a user who asked to reset their password.
// Sent by: sendResetPasswordEmail in src/lib/email.ts.
// Triggered in: emailAndPassword.sendResetPassword in src/lib/auth.ts.
export default function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your Doka password.">
      <Heading style={heading}>Reset your password</Heading>
      <Text style={paragraph}>Hi {name || "there"},</Text>
      <Text style={paragraph}>
        We received a request to reset the password for your Doka account. Choose a new one with
        the button below.
      </Text>
      <EmailButton href={resetUrl}>Choose a new password</EmailButton>
      <Text style={small}>This link expires in 1 hour and works once.</Text>
      <Text style={small}>
        If you did not ask for this, ignore this email. Your password stays the same.
      </Text>
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  name: "Ada",
  resetUrl: "http://localhost:3000/api/auth/reset-password/sample-token",
} satisfies ResetPasswordEmailProps;
