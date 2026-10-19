
"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          background: "#FBF3F8",
          color: "#2B0F20",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
          Something went wrong
        </h1>

        <p style={{ maxWidth: 420, color: "#6B4A5C", lineHeight: 1.6 }}>
          Doka ran into an unexpected problem. Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            padding: "12px 32px",
            border: 0,
            borderRadius: 12,
            background: "#8E2B5C",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
