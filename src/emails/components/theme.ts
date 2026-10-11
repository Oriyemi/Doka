import type { CSSProperties } from "react";

// Email clients cannot read CSS variables or Tailwind classes, so every style
// in src/emails is an inline style object. These values are copied from the
// @theme block in src/app/globals.css. If the brand colours change there,
// change them here too. `surface` is the white card and has no CSS variable.
export const colors = {
  primary: "#8c2d53",
  primarySoft: "#f8eaf0",
  canvas: "#fbf6f8",
  surface: "#ffffff",
  ink: "#2a1a22",
  muted: "#7a6670",
  line: "#ecdde4",
};

export const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const heading: CSSProperties = {
  margin: "0 0 16px",
  color: colors.ink,
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "30px",
};

export const paragraph: CSSProperties = {
  margin: "0 0 16px",
  color: colors.ink,
  fontSize: "15px",
  lineHeight: "24px",
};

// For secondary lines such as "this link expires in 60 minutes".
export const small: CSSProperties = {
  margin: "0 0 8px",
  color: colors.muted,
  fontSize: "13px",
  lineHeight: "20px",
};
