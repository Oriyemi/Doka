import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingDeclinedEmailProps = {
  booking: BookingSummary;
  // Optional note from the provider. The paragraph is left out when empty.
  reason?: string;
  servicesUrl: string;
};

// To: the customer, when the provider declines their booking.
// Sent by: sendBookingDeclinedEmail in src/lib/email.ts.
// Not triggered anywhere yet. See the comment on that function.
export default function BookingDeclinedEmail({
  booking,
  reason,
  servicesUrl,
}: BookingDeclinedEmailProps) {
  return (
    <EmailLayout preview={`${booking.providerName} could not take your booking.`}>
      <Heading style={heading}>Your booking was declined</Heading>
      <Text style={paragraph}>Hi {booking.customerName || "there"},</Text>
      <Text style={paragraph}>
        {booking.providerName} could not take this booking, so it will not go ahead.
      </Text>
      {reason ? (
        <Text style={paragraph}>
          Their note: {reason}
        </Text>
      ) : null}
      <BookingDetails booking={booking} audience="customer" />
      <EmailButton href={servicesUrl}>Find another service</EmailButton>
    </EmailLayout>
  );
}

BookingDeclinedEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  reason: "I am fully booked that morning. Afternoons are free.",
  servicesUrl: "http://localhost:3000/services",
} satisfies BookingDeclinedEmailProps;
