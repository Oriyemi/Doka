import "server-only";
import { createElement, type ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import MagicLinkEmail from "@/emails/auth/MagicLinkEmail";
import NewLoginEmail, { type NewLoginEmailProps } from "@/emails/auth/NewLoginEmail";
import OtpEmail, { type OtpPurpose } from "@/emails/auth/OtpEmail";
import PasswordChangedEmail from "@/emails/auth/PasswordChangedEmail";
import ResetPasswordEmail from "@/emails/auth/ResetPasswordEmail";
import VerifyEmail from "@/emails/auth/VerifyEmail";
import WelcomeEmail from "@/emails/auth/WelcomeEmail";
import BookingCancelledEmail from "@/emails/bookings/BookingCancelledEmail";
import BookingConfirmedEmail from "@/emails/bookings/BookingConfirmedEmail";
import BookingDeclinedEmail from "@/emails/bookings/BookingDeclinedEmail";
import BookingPendingReminderEmail from "@/emails/bookings/BookingPendingReminderEmail";
import BookingReminderEmail from "@/emails/bookings/BookingReminderEmail";
import BookingRequestReceivedEmail from "@/emails/bookings/BookingRequestReceivedEmail";
import NewBookingRequestEmail from "@/emails/bookings/NewBookingRequestEmail";
import type { BookingSummary } from "@/emails/components/BookingDetails";

// How email works in this app:
//
//   src/emails/**     the templates. What each email looks like and says.
//   src/lib/email.ts  this file. One send function per email. Each one picks
//                     the template, sets the subject and fills in the links.
//   callers           src/lib/auth.ts and the booking server actions. They
//                     call a send function and never touch Resend or a template.
//
// To add an email: add a template under src/emails, then add a send function
// at the bottom of this file.
//
// Needs RESEND_API_KEY, EMAIL_FROM and BETTER_AUTH_URL in .env.local.

let client: Resend | undefined;

function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Turns an app path such as "/dashboard" into a full link. Emails are opened
// outside the app, so every link in them has to be absolute.
function appUrl(path: string) {
  if (!process.env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is not set");
  }
  return new URL(path, process.env.BETTER_AUTH_URL).toString();
}

// Every send function below goes through here. It renders the template twice,
// once as HTML and once as plain text, and sends both. Inboxes that block HTML
// show the text version, and having one lowers the chance of landing in spam.
// Returns the Resend email id. Throws if Resend rejects the email.
async function send(to: string, subject: string, template: ReactElement) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }

  const [html, text] = await Promise.all([
    render(template),
    render(template, { plainText: true }),
  ]);

  const { data, error } = await getClient().emails.send({ from, to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.message}`);
  }
  return data.id;
}

// ---------------------------------------------------------------------------
// Account emails. All seven are wired up in src/lib/auth.ts.
// ---------------------------------------------------------------------------

// "Confirm your email address". `verifyUrl` comes from Better Auth.
export function sendVerifyEmail(to: string, props: { name: string; verifyUrl: string }) {
  return send(to, "Confirm your email address", createElement(VerifyEmail, props));
}

// "Welcome to Doka". Sent once, after the email address is confirmed.
export function sendWelcomeEmail(to: string, props: { name: string }) {
  return send(
    to,
    "Welcome to Doka",
    createElement(WelcomeEmail, { ...props, dashboardUrl: appUrl("/dashboard") }),
  );
}

// "Reset your password". `resetUrl` comes from Better Auth.
export function sendResetPasswordEmail(to: string, props: { name: string; resetUrl: string }) {
  return send(to, "Reset your Doka password", createElement(ResetPasswordEmail, props));
}

// Security notice after a password reset succeeds.
export function sendPasswordChangedEmail(to: string, props: { name: string }) {
  return send(
    to,
    "Your Doka password was changed",
    createElement(PasswordChangedEmail, { ...props, signInUrl: appUrl("/sign-in") }),
  );
}

// Security notice after a sign-in.
export function sendNewLoginEmail(to: string, props: Omit<NewLoginEmailProps, "signInUrl">) {
  return send(
    to,
    "New sign-in to your Doka account",
    createElement(NewLoginEmail, { ...props, signInUrl: appUrl("/sign-in") }),
  );
}

// "Sign in to Doka" with a one-click link. `signInUrl` comes from Better Auth.
export function sendMagicLinkEmail(to: string, props: { signInUrl: string }) {
  return send(to, "Sign in to Doka", createElement(MagicLinkEmail, props));
}

// A one-time code. `purpose` is the `type` Better Auth passes along, and it
// decides the subject and the wording.
export function sendOtpEmail(to: string, props: { otp: string; purpose: OtpPurpose }) {
  const subject =
    props.purpose === "sign-in" ? "Your Doka sign-in code" : "Your Doka verification code";
  return send(to, subject, createElement(OtpEmail, props));
}

// ---------------------------------------------------------------------------
// Booking emails.
//
// Wired up:
//   sendBookingRequestReceivedEmail  createBooking (customer)
//   sendNewBookingRequestEmail       createBooking (provider)
//   sendBookingConfirmedEmail        respond, on Accept
//   sendBookingDeclinedEmail         respond, on Decline
// Not wired up yet: cancelled, pending reminder and booking reminder.
//
// `booking` is a BookingSummary (see src/emails/components/BookingDetails.tsx).
// Format `when`, `duration` and `price` before passing them in.
//
// A send can fail (Resend down, bad address). Do not let that undo a booking
// that has already been saved. Call these inside after() and log failures.
// ---------------------------------------------------------------------------

// Where the provider reviews incoming requests.
const PROVIDER_INCOMING = "/provider/dashboard/bookings?tab=incoming";
const PROVIDER_BOOKINGS = "/provider/dashboard/bookings";
// The customer's bookings page does not exist yet, so these links 404 until
// it is built.
const CUSTOMER_BOOKINGS = "/dashboard/bookings";

// To the customer: "we have your request, waiting on the provider".
// Call from the server action that creates a booking, after the row is saved.
export function sendBookingRequestReceivedEmail(to: string, props: { booking: BookingSummary }) {
  return send(
    to,
    `Booking request sent: ${props.booking.serviceName}`,
    createElement(BookingRequestReceivedEmail, {
      ...props,
      bookingsUrl: appUrl(CUSTOMER_BOOKINGS),
    }),
  );
}

// To the provider: "a customer just booked your service".
// Call from the same server action as the one above, with the provider's
// email address. A new booking sends both.
export function sendNewBookingRequestEmail(to: string, props: { booking: BookingSummary }) {
  return send(
    to,
    `New booking request from ${props.booking.customerName}`,
    createElement(NewBookingRequestEmail, { ...props, reviewUrl: appUrl(PROVIDER_INCOMING) }),
  );
}

// To the provider: "this booking is still waiting for your approval".
// Nothing in a web request can fire this, because it depends on time passing.
// It needs a scheduled job (a cron) that runs every few minutes and:
//   1. finds bookings that are still pending and were created over an hour ago,
//   2. skips any that already had a reminder (pending_reminder_sent_at is set),
//   3. calls this function, then records that the reminder was sent.
export function sendBookingPendingReminderEmail(
  to: string,
  props: { booking: BookingSummary; waitingFor: string },
) {
  return send(
    to,
    `Still waiting for your answer: ${props.booking.serviceName}`,
    createElement(BookingPendingReminderEmail, {
      ...props,
      reviewUrl: appUrl(PROVIDER_INCOMING),
    }),
  );
}

// To the customer: "your booking is confirmed".
// Called from the Accept branch of respond in the provider's bookings actions.
export function sendBookingConfirmedEmail(to: string, props: { booking: BookingSummary }) {
  return send(
    to,
    `Booking confirmed: ${props.booking.serviceName}`,
    createElement(BookingConfirmedEmail, { ...props, bookingsUrl: appUrl(CUSTOMER_BOOKINGS) }),
  );
}

// To the customer: "your booking was declined".
// Called from the Decline branch of respond in the provider's bookings actions.
export function sendBookingDeclinedEmail(
  to: string,
  props: { booking: BookingSummary; reason?: string },
) {
  return send(
    to,
    `Booking declined: ${props.booking.serviceName}`,
    createElement(BookingDeclinedEmail, { ...props, servicesUrl: appUrl("/explore") }),
  );
}

// To whoever did NOT cancel. `recipient` is the role of the person getting the
// email: "provider" when the customer cancelled, "customer" when the provider
// did. Call from the server action that cancels a booking.
export function sendBookingCancelledEmail(
  to: string,
  props: { booking: BookingSummary; recipient: "customer" | "provider" },
) {
  const bookingsPath = props.recipient === "provider" ? PROVIDER_BOOKINGS : CUSTOMER_BOOKINGS;
  return send(
    to,
    `Booking cancelled: ${props.booking.serviceName}`,
    createElement(BookingCancelledEmail, { ...props, bookingsUrl: appUrl(bookingsPath) }),
  );
}

// To the customer: "your booking is tomorrow".
// Needs a scheduled job, like the pending reminder above. The job finds
// accepted bookings that start within the reminder window and have no
// reminder_sent_at yet.
export function sendBookingReminderEmail(
  to: string,
  props: { booking: BookingSummary; startsIn: string },
) {
  return send(
    to,
    `Reminder: ${props.booking.serviceName} is ${props.startsIn}`,
    createElement(BookingReminderEmail, { ...props, bookingsUrl: appUrl(CUSTOMER_BOOKINGS) }),
  );
}