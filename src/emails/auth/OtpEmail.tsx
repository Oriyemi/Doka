import { Heading, Text } from "react-email";
import { EmailLayout } from "../components/EmailLayout";
import { colors, heading, paragraph, small } from "../components/theme";

// The four reasons Better Auth's emailOTP plugin sends a code.
export type OtpPurpose = "sign-in" | "email-verification" | "forget-password" | "change-email";

export type OtpEmailProps = {
  otp: string;
  purpose: OtpPurpose;
};

const copy: Record<OtpPurpose, { title: string; intro: string }> = {
  "sign-in": {
    title: "Your sign-in code",
    intro: "Enter this code to sign in to Doka.",
  },
  "email-verification": {
    title: "Confirm your email address",
    intro: "Enter this code to confirm your email address.",
  },
  "forget-password": {
    title: "Reset your password",
    intro: "Enter this code to choose a new password.",
  },
  "change-email": {
    title: "Confirm your new email address",
    intro: "Enter this code to confirm the new email address for your Doka account.",
  },
};

// To: someone who asked for a one-time code.
// Sent by: sendOtpEmail in src/lib/email.ts.
// Triggered in: the emailOTP plugin in src/lib/auth.ts.
// One template covers all four purposes. Only the title and first line change.
export default function OtpEmail({ otp, purpose }: OtpEmailProps) {
  const { title, intro } = copy[purpose];

  return (
    <EmailLayout preview={`${otp} is your Doka code.`}>
      <Heading style={heading}>{title}</Heading>
      <Text style={paragraph}>{intro}</Text>
      <Text
        style={{
          margin: "8px 0 24px",
          padding: "16px",
          backgroundColor: colors.primarySoft,
          borderRadius: "12px",
          color: colors.primary,
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "8px",
          lineHeight: "40px",
          textAlign: "center",
        }}
      >
        {otp}
      </Text>
      <Text style={small}>This code expires in 5 minutes.</Text>
      <Text style={small}>
        If you did not ask for it, ignore this email. Never share this code with anyone.
      </Text>
    </EmailLayout>
  );
}

OtpEmail.PreviewProps = {
  otp: "482913",
  purpose: "sign-in",
} satisfies OtpEmailProps;
