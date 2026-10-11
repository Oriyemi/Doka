import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph, small } from "../components/theme";

export type PasswordChangedEmailProps = {
  name: string;
  signInUrl: string;
};

// To: a user whose password was just reset through the reset link.
// Sent by: sendPasswordChangedEmail in src/lib/email.ts.
// Triggered in: emailAndPassword.onPasswordReset in src/lib/auth.ts.
// This is a security notice. It lets the real owner know if someone else
// reset their password.
export default function PasswordChangedEmail({ name, signInUrl }: PasswordChangedEmailProps) {
  return (
    <EmailLayout preview="Your Doka password was changed.">
      <Heading style={heading}>Your password was changed</Heading>
      <Text style={paragraph}>Hi {name || "there"},</Text>
      <Text style={paragraph}>
        The password for your Doka account was just changed. You can sign in with the new one
        now.
      </Text>
      <EmailButton href={signInUrl}>Sign in</EmailButton>
      <Text style={small}>
        If you did not change your password, someone else may have access to your email. Reset
        your password again from the sign-in page straight away.
      </Text>
    </EmailLayout>
  );
}

PasswordChangedEmail.PreviewProps = {
  name: "Ada",
  signInUrl: "http://localhost:3000/sign-in",
} satisfies PasswordChangedEmailProps;
