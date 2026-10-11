import type { ReactNode } from "react";
import { Button, Section } from "react-email";
import { colors } from "./theme";

type EmailButtonProps = {
  href: string;
  children: ReactNode;
};

// The one call to action in an email. Each template uses at most one.
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={{ margin: "8px 0 24px" }}>
      <Button
        href={href}
        style={{
          padding: "12px 24px",
          backgroundColor: colors.primary,
          borderRadius: "10px",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
