import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingCancelledEmailProps = {
  booking: BookingSummary;
  // Who is reading the email. It goes to the person who did NOT cancel: the
  // provider when the customer cancels, the customer when the provider does.
  recipient: "customer" | "provider";
  bookingsUrl: string;
};

// To: the other party, when a booking is cancelled after it was made.
// Sent by: sendBookingCancelledEmail in src/lib/email.ts.
// Not triggered anywhere yet. See the comment on that function.
export default function BookingCancelledEmail({
  booking,
  recipient,
  bookingsUrl,
}: BookingCancelledEmailProps) {
  const recipientName = recipient === "customer" ? booking.customerName : booking.providerName;
  const cancelledBy = recipient === "customer" ? booking.providerName : booking.customerName;

  return (
    <EmailLayout preview={`${cancelledBy} cancelled the booking for ${booking.when}.`}>
      <Heading style={heading}>A booking was cancelled</Heading>
      <Text style={paragraph}>Hi {recipientName || "there"},</Text>
      <Text style={paragraph}>
        {cancelledBy} cancelled the booking below. It will not go ahead.
      </Text>
      <BookingDetails booking={booking} audience={recipient} />
      <EmailButton href={bookingsUrl}>View your bookings</EmailButton>
    </EmailLayout>
  );
}

BookingCancelledEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada Obi",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  recipient: "provider",
  bookingsUrl: "http://localhost:3000/provider/bookings",
} satisfies BookingCancelledEmailProps;
