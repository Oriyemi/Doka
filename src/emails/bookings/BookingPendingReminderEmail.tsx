import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingPendingReminderEmailProps = {
  booking: BookingSummary;
  // How long the request has been waiting, for example "1 hour".
  waitingFor: string;
  reviewUrl: string;
};

// To: the provider, when a booking request has sat unanswered for an hour.
// Sent by: sendBookingPendingReminderEmail in src/lib/email.ts.
// Not triggered anywhere yet. This one needs a scheduled job. See the comment
// on that function.
export default function BookingPendingReminderEmail({
  booking,
  waitingFor,
  reviewUrl,
}: BookingPendingReminderEmailProps) {
  return (
    <EmailLayout preview={`${booking.customerName} is still waiting for your answer.`}>
      <Heading style={heading}>A booking is still waiting for your approval</Heading>
      <Text style={paragraph}>Hi {booking.providerName || "there"},</Text>
      <Text style={paragraph}>
        {booking.customerName} asked to book {booking.serviceName} {waitingFor} ago and has not
        had an answer yet. Accept or decline so they know where they stand.
      </Text>
      <BookingDetails booking={booking} audience="provider" />
      <EmailButton href={reviewUrl}>Respond now</EmailButton>
    </EmailLayout>
  );
}

BookingPendingReminderEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada Obi",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  waitingFor: "1 hour",
  reviewUrl: "http://localhost:3000/provider/bookings",
} satisfies BookingPendingReminderEmailProps;
