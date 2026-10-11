import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph, small } from "../components/theme";

export type VerifyEmailProps = {
  name: string;
  // Better Auth builds this link. It carries the one-time verification token.
  verifyUrl: string;
};

// To: a new user, right after they sign up with email and password.
// Sent by: sendVerifyEmail in src/lib/email.ts.
// Triggered in: emailVerification.sendVerificationEmail in src/lib/auth.ts.
export default function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirm your email address to finish setting up Doka.">
      <Heading style={heading}>Confirm your email address</Heading>
      <Text style={paragraph}>Hi {name || "there"},</Text>
      <Text style={paragraph}>
        Thanks for signing up to Doka. Confirm that this is your email address and your account
        is ready to use.
      </Text>
      <EmailButton href={verifyUrl}>Confirm email</EmailButton>
      <Text style={small}>This link expires in 1 hour.</Text>
      <Text style={small}>If you did not create a Doka account, ignore this email.</Text>
    </EmailLayout>
  );
}

// Sample data for the preview server (`npm run email`). Never sent.
VerifyEmail.PreviewProps = {
  name: "Ada",
  verifyUrl: "http://localhost:3000/api/auth/verify-email?token=sample",
} satisfies VerifyEmailProps;
