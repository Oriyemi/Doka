
import { betterAuth } from "better-auth";
import { magicLink, emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Doka <noreply@suigenerisattorneys.com>",
        to: user.email,
        subject: "Reset your Doka password",
        html: `
          <div>
            <h2>Reset your password</h2>
            <p>We received a request to reset your password.</p>
            <p>
              <a href="${url}">Click here to reset your password</a>
            </p>
            <p>
              If you did not request this, you can ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Doka <noreply@suigenerisattorneys.com>",
        to: user.email,
        subject: "Verify your Doka email address",
        html: `
          <div>
            <h2>Verify your email address</h2>
            <p>Please click the link below to verify your email.</p>
            <p>
              <a href="${url}">Verify my email</a>
            </p>
          </div>
        `,
      });
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "Doka <noreply@suigenerisattorneys.com>",
          to: email,
          subject: "Sign in to Doka",
          html: `
            <div>
              <h2>Sign in to Doka</h2>
              <p>Click the link below to sign in.</p>
              <p>
                <a href="${url}">Sign in to your account</a>
              </p>
            </div>
          `,
        });
      },
    }),

    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await resend.emails.send({
          from: "Doka <noreply@suigenerisattorneys.com>",
          to: email,
          subject:
            type === "sign-in"
              ? "Your Doka sign-in code"
              : "Your Doka verification code",
          html: `
            <div>
              <h2>Your verification code</h2>
              <p>Use the code below to continue:</p>
              <h1>${otp}</h1>
              <p>If you did not request this code, you can ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
});
