import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type WelcomeEmailProps = {
  name: string;
  dashboardUrl: string;
};

// To: a new user, once their email address is confirmed.
// Sent by: sendWelcomeEmail in src/lib/email.ts.
// Triggered in: src/lib/auth.ts, in two places. Email sign-ups get it from
// emailVerification.afterEmailVerification. Google sign-ups get it from
// databaseHooks.user.create.after, because Google has already verified them.
export default function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Your Doka account is ready.">
      <Heading style={heading}>Welcome to Doka{name ? `, ${name}` : ""}</Heading>
      <Text style={paragraph}>
        Your account is ready. You can browse services, book a time that suits you, and keep
        track of every booking from your dashboard.
      </Text>
      <Text style={paragraph}>
        Offering a service yourself? You can list it and manage your availability from the same
        account.
      </Text>
      <EmailButton href={dashboardUrl}>Go to your dashboard</EmailButton>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  name: "Ada",
  dashboardUrl: "http://localhost:3000/dashboard",
} satisfies WelcomeEmailProps;
