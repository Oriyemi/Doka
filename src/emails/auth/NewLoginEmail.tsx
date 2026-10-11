import { Heading, Text } from "react-email";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph, small } from "../components/theme";

export type NewLoginEmailProps = {
  name: string;
  // Already formatted, for example "11 Oct 2026, 09:40 UTC".
  time: string;
  // For example "Chrome on macOS". Left out when the browser is unknown.
  device?: string;
  ipAddress?: string;
  signInUrl: string;
};

// To: a user, each time they sign in.
// Sent by: sendNewLoginEmail in src/lib/email.ts.
// Triggered in: databaseHooks.session.create.after in src/lib/auth.ts.
export default function NewLoginEmail({
  name,
  time,
  device,
  ipAddress,
  signInUrl,
}: NewLoginEmailProps) {
  return (
    <EmailLayout preview="New sign-in to your Doka account.">
      <Heading style={heading}>New sign-in to your account</Heading>
      <Text style={paragraph}>Hi {name || "there"},</Text>
      <Text style={paragraph}>Your Doka account was just signed in to.</Text>
      <Text style={paragraph}>
        Time: {time}
        {device ? (
          <>
            <br />
            Device: {device}
          </>
        ) : null}
        {ipAddress ? (
          <>
            <br />
            IP address: {ipAddress}
          </>
        ) : null}
      </Text>
      <Text style={paragraph}>If this was you, there is nothing to do.</Text>
      <EmailButton href={signInUrl}>This was not me</EmailButton>
      <Text style={small}>
        The button takes you to the sign-in page, where you can reset your password. Resetting it
        signs out every other device.
      </Text>
    </EmailLayout>
  );
}

NewLoginEmail.PreviewProps = {
  name: "Ada",
  time: "11 Oct 2026, 09:40 UTC",
  device: "Chrome on macOS",
  ipAddress: "102.89.34.12",
  signInUrl: "http://localhost:3000/sign-in",
} satisfies NewLoginEmailProps;
