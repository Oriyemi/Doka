import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { after, userAgentFromString } from "next/server";
import { db } from "@/lib/db";
import {
  sendMagicLinkEmail,
  sendNewLoginEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
  sendVerifyEmail,
  sendWelcomeEmail,
} from "@/lib/email";

// Sends an email after the response has gone back to the browser, so a slow
// or failed send never blocks sign-in and response timing can't reveal which
// emails are registered.
function sendInBackground(send: () => Promise<unknown>) {
  after(async () => {
    try {
      await send();
    } catch (error) {
      console.error("[email] send failed:", error);
    }
  });
}

function formatLoginTime(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}

function describeDevice(userAgent: string | null | undefined) {
  if (!userAgent) return undefined;
  const { browser, os } = userAgentFromString(userAgent);
  if (browser.name && os.name) return `${browser.name} on ${os.name}`;
  return browser.name ?? os.name;
}

// Per-email limit for "resend confirmation email".
const VERIFY_EMAIL_RESEND_LIMIT = 5;
const VERIFY_EMAIL_RESEND_WINDOW_MS = 60 * 60 * 1000;

export const auth = betterAuth({
  database: db,

  trustedOrigins: [
    "http://localhost:3000",
    "https://doka-lilac.vercel.app",
  ],

  // Counts live in the database, so they are shared across serverless
  // instances on Vercel (the default in-memory store is not).
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/forget-password": { window: 300, max: 3 },
    },
  },

  user: {
    additionalFields: {
      onboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        input: false,
      },
      verificationStatus: {
        type: "string",
        required: false,
        defaultValue: "unverified",
        input: false,
        fieldName: "verification_status",
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Sign-in is blocked until the email is confirmed.
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      sendInBackground(() =>
        sendResetPasswordEmail(user.email, { name: user.name, resetUrl: url }),
      );
    },

    onPasswordReset: async ({ user }) => {
      sendInBackground(() =>
        sendPasswordChangedEmail(user.email, { name: user.name }),
      );
    },

    revokeSessionsOnPasswordReset: true,
  },
  

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      sendInBackground(() =>
        sendVerifyEmail(user.email, { name: user.name, verifyUrl: url }),
      );
    },

    afterEmailVerification: async (user) => {
      sendInBackground(() => sendWelcomeEmail(user.email, { name: user.name }));
    },
  },

  hooks: {
    // Rate limit "resend confirmation email" per recipient address. The
    // counter is a row in Better Auth's `verification` table that expires
    // with the window. Every request counts, including unknown addresses, so
    // the limit can't be used to find out which emails are registered.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/send-verification-email") return;

      const email =
        typeof ctx.body?.email === "string"
          ? ctx.body.email.trim().toLowerCase()
          : "";
      if (!email) return;

      const { internalAdapter } = ctx.context;
      const identifier = `verify-email-limit:${email}`;
      const counter = await internalAdapter.findVerificationValue(identifier);
      const msLeft = counter
        ? new Date(counter.expiresAt).getTime() - Date.now()
        : 0;

      if (!counter || msLeft <= 0) {
        if (counter) {
          await internalAdapter.deleteVerificationByIdentifier(identifier);
        }
        await internalAdapter.createVerificationValue({
          identifier,
          value: "1",
          expiresAt: new Date(Date.now() + VERIFY_EMAIL_RESEND_WINDOW_MS),
        });
        return;
      }

      const sent = Number(counter.value);
      if (sent >= VERIFY_EMAIL_RESEND_LIMIT) {
        const minutes = Math.ceil(msLeft / 60_000);
        throw new APIError("TOO_MANY_REQUESTS", {
          message: `Too many confirmation emails. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        });
      }

      await internalAdapter.updateVerificationByIdentifier(identifier, {
        value: String(sent + 1),
      });
    }),
  },

  databaseHooks: {
    user: {
      create: {
        // Welcome email for accounts that are already verified at creation
        // (Google, magic link, one-time code).
        after: async (user) => {
          if (!user.emailVerified) return;
          sendInBackground(() => sendWelcomeEmail(user.email, { name: user.name }));
        },
      },
    },

    session: {
      create: {
        // "New sign-in" alert. Skips sessions created by sign-up or by
        // clicking the confirmation link.
        after: async (session, ctx) => {
          if (!ctx) return;

          const isSignIn =
            ctx.path.startsWith("/sign-in") ||
            ctx.path.startsWith("/callback") ||
            ctx.path.startsWith("/magic-link");
          if (!isSignIn) return;

          const user = await ctx.context.internalAdapter.findUserById(
            session.userId,
          );
          if (!user) return;

          // A brand-new account gets the welcome email instead.
          const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
          if (accountAgeMs < 60_000) return;

          sendInBackground(() =>
            sendNewLoginEmail(user.email, {
              name: user.name,
              time: formatLoginTime(new Date(session.createdAt)),
              device: describeDevice(session.userAgent),
              ipAddress: session.ipAddress ?? undefined,
            }),
          );
        },
      },
    },
  },

  plugins: [
    // Remove magicLink and emailOTP if your UI doesn't use them (see note).
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        sendInBackground(() => sendMagicLinkEmail(email, { signInUrl: url }));
      },
    }),

    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        sendInBackground(() => sendOtpEmail(email, { otp, purpose: type }));
      },
    }),

    nextCookies(), // keep this last
  ],
});