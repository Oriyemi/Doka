import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP, magicLink } from "better-auth/plugins";
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

// Every email this file sends goes through a send function in src/lib/email.ts,
// which picks the template from src/emails and the sender from EMAIL_FROM.
// Nothing here talks to Resend or writes HTML.

// Sends an email after the response has gone back to the browser.
//
// Two reasons. First, a slow or failed send must never block or break a
// sign-in. A failure here is logged and the request still succeeds. Second,
// if "reset password" took longer for real accounts than for unknown ones, an
// attacker could time the request to learn which emails are registered.
//
// `after` only works while Next is handling a request. Calling an auth
// function from a standalone script would throw here.
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

// Turns a raw browser user-agent string into "Chrome on macOS".
function describeDevice(userAgent: string | null | undefined) {
  if (!userAgent) return undefined;
  const { browser, os } = userAgentFromString(userAgent);
  if (browser.name && os.name) return `${browser.name} on ${os.name}`;
  return browser.name ?? os.name;
}

// RATE LIMIT for the "resend confirmation email" request, counted per email
// address. One address can be re-sent the email this many times per window, no
// matter who asks or from which device. Change the two numbers to tune it.
// The email sent at sign-up is not counted, so the real ceiling for one
// address is 1 + VERIFY_EMAIL_RESEND_LIMIT emails per window.
const VERIFY_EMAIL_RESEND_LIMIT = 100;
const VERIFY_EMAIL_RESEND_WINDOW_MS = 60 * 60 * 1000;

// Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from .env.local on its own.
export const auth = betterAuth({
  // Users, sessions and accounts are stored in the Postgres database from
  // DATABASE_URL. Without this line Better Auth keeps nothing between restarts.
  database: db,

  emailAndPassword: {
    enabled: true,

    // Sign-in is blocked until the person clicks the link in the confirmation
    // email, and signing up does not sign them in. The sign-in page handles
    // the refusal (its 403 branch) and offers to resend the email. Set this to
    // false to let people in before they confirm.
    requireEmailVerification: true,

    // EMAIL: reset password.
    // Runs when the client calls authClient.requestPasswordReset({ email, redirectTo }).
    // `url` is the link Better Auth built. It sends the user to `redirectTo`
    // with the token attached. That page does not exist in the app yet.
    sendResetPassword: async ({ user, url }) => {
      sendInBackground(() =>
        sendResetPasswordEmail(user.email, { name: user.name, resetUrl: url }),
      );
    },

    // EMAIL: password changed.
    // Runs after a reset link was used and the new password is saved.
    onPasswordReset: async ({ user }) => {
      sendInBackground(() => sendPasswordChangedEmail(user.email, { name: user.name }));
    },

    // A password reset signs the account out everywhere. The "new sign-in"
    // email tells people to reset their password if the sign-in was not them,
    // and this is what makes that advice work.
    revokeSessionsOnPasswordReset: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  emailVerification: {
    // Send the confirmation email as soon as someone signs up. The sign-up
    // page tells them to check their inbox, so this has to be on.
    sendOnSignUp: true,
    // Clicking the link in the email also signs them in.
    autoSignInAfterVerification: true,

    // EMAIL: confirm your email address.
    // Also runs when the sign-in page calls authClient.sendVerificationEmail()
    // from its "resend" link.
    sendVerificationEmail: async ({ user, url }) => {
      sendInBackground(() => sendVerifyEmail(user.email, { name: user.name, verifyUrl: url }));
    },

    // EMAIL: welcome, for people who signed up with email and password.
    // It waits for the address to be confirmed so a new user gets one email
    // at a time: "confirm your email" first, "welcome" once they have.
    afterEmailVerification: async (user) => {
      sendInBackground(() => sendWelcomeEmail(user.email, { name: user.name }));
    },
  },

  // Request hooks run before Better Auth handles a request to /api/auth/*.
  hooks: {
    // RATE LIMIT: resend confirmation email (see the constants at the top).
    //
    // Better Auth has its own rate limiter, but it counts per IP address and
    // is only on in production. Someone switching networks could still flood
    // one inbox, and bounces and spam reports hurt the sending domain. So this
    // counts per recipient instead.
    //
    // The counter is a row in Better Auth's own `verification` table, named
    // `verify-email-limit:<email>`, which expires when the window ends. Better
    // Auth deletes expired rows itself, so there is nothing to clean up and no
    // new table.
    //
    // Every request counts, including ones for addresses that have no account.
    // Counting only real accounts would let someone probe which emails are
    // registered by watching when the limit kicks in.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/send-verification-email") return;

      const email = typeof ctx.body?.email === "string" ? ctx.body.email.trim().toLowerCase() : "";
      if (!email) return;

      const { internalAdapter } = ctx.context;
      const identifier = `verify-email-limit:${email}`;
      const counter = await internalAdapter.findVerificationValue(identifier);
      const msLeft = counter ? new Date(counter.expiresAt).getTime() - Date.now() : 0;

      // First request in a new window: start counting.
      if (!counter || msLeft <= 0) {
        if (counter) await internalAdapter.deleteVerificationByIdentifier(identifier);
        await internalAdapter.createVerificationValue({
          identifier,
          value: "1",
          expiresAt: new Date(Date.now() + VERIFY_EMAIL_RESEND_WINDOW_MS),
        });
        return;
      }

      // Over the limit: stop here with a 429. No email is sent, and the
      // sign-in page shows this message under the resend link.
      const sent = Number(counter.value);
      if (sent >= VERIFY_EMAIL_RESEND_LIMIT) {
        const minutes = Math.ceil(msLeft / 60_000);
        throw new APIError("TOO_MANY_REQUESTS", {
          message: `Too many confirmation emails. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        });
      }

      await internalAdapter.updateVerificationByIdentifier(identifier, { value: String(sent + 1) });
    }),
  },

  // Database hooks run whenever Better Auth writes a row, whichever sign-in
  // method caused it.
  databaseHooks: {
    user: {
      create: {
        // EMAIL: welcome, for people whose address is already verified when
        // the account is created: Google, magic link and one-time code
        // sign-ups. They never go through the confirmation step above. Email
        // and password sign-ups arrive here unverified and are skipped.
        after: async (user) => {
          if (!user.emailVerified) return;
          sendInBackground(() => sendWelcomeEmail(user.email, { name: user.name }));
        },
      },
    },

    session: {
      create: {
        // EMAIL: new sign-in.
        // A session row is created on every sign-in, but also right after
        // sign-up and after clicking the confirmation link. Those two are not
        // "someone signed in to your account", so the checks below skip them.
        after: async (session, ctx) => {
          if (!ctx) return;

          // Only real sign-ins: password or one-time code (/sign-in/*), the
          // return trip from Google (/callback/*), or a magic link.
          const isSignIn =
            ctx.path.startsWith("/sign-in") ||
            ctx.path.startsWith("/callback") ||
            ctx.path.startsWith("/magic-link");
          if (!isSignIn) return;

          const user = await ctx.context.internalAdapter.findUserById(session.userId);
          if (!user) return;

          // A first Google, magic link or code sign-in also creates the
          // account. That person is getting the welcome email, so skip the alert.
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
    magicLink({
      // EMAIL: sign-in link.
      // Runs when the client calls authClient.signIn.magicLink({ email }).
      sendMagicLink: async ({ email, url }) => {
        sendInBackground(() => sendMagicLinkEmail(email, { signInUrl: url }));
      },
    }),

    emailOTP({
      // EMAIL: one-time code.
      // `type` says why the code was asked for (sign-in, email verification,
      // forgotten password or email change). The template words itself to match.
      sendVerificationOTP: async ({ email, otp, type }) => {
        sendInBackground(() => sendOtpEmail(email, { otp, purpose: type }));
      },
    }),
  ],
});
