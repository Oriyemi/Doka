import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph, small } from "../components/theme";

export type MagicLinkEmailProps = {
  // Better Auth builds this link. Opening it signs the person in.
  signInUrl: string;
};

// To: someone who asked to sign in with an emailed link instead of a password.
// Sent by: sendMagicLinkEmail in src/lib/email.ts.
// Triggered in: the magicLink plugin in src/lib/auth.ts.
// There is no name here because the person may not have an account yet.
export default function MagicLinkEmail({ signInUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your sign-in link for Doka.">
      <Heading style={heading}>Sign in to Doka</Heading>
      <Text style={paragraph}>Use the button below to sign in. No password needed.</Text>
      <EmailButton href={signInUrl}>Sign in</EmailButton>
      <Text style={small}>This link expires in 5 minutes and works once.</Text>
      <Text style={small}>If you did not ask to sign in, ignore this email.</Text>
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  signInUrl: "http://localhost:3000/api/auth/magic-link/verify?token=sample",
} satisfies MagicLinkEmailProps;
