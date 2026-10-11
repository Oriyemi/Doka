import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Section, Text } from "react-email";
import { colors, fontFamily } from "./theme";

type EmailLayoutProps = {
  // The grey snippet an inbox shows next to the subject line.
  preview: string;
  children: ReactNode;
};

// Every template wraps its content in this layout, so the header, the white
// card and the footer are defined once. Change the look of all emails here.
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "32px 16px", backgroundColor: colors.canvas, fontFamily }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Text
            style={{
              margin: "0 0 20px",
              color: colors.primary,
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Doka
          </Text>
          <Section
            style={{
              padding: "32px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.line}`,
              borderRadius: "16px",
            }}
          >
            {children}
          </Section>
          <Text
            style={{
              margin: "20px 0 0",
              color: colors.muted,
              fontSize: "12px",
              lineHeight: "18px",
              textAlign: "center",
            }}
          >
            Sent by Doka. If you were not expecting this email, you can ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
