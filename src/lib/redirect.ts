// Only allow paths inside this site. Anything else (another website, "//host",
// backslash tricks) falls back to the default.
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/explore",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}