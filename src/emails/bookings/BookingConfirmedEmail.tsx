import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingConfirmedEmailProps = {
  booking: BookingSummary;
  bookingsUrl: string;
};

// To: the customer, when the provider accepts their booking.
// Sent by: sendBookingConfirmedEmail in src/lib/email.ts.
// Not triggered anywhere yet. See the comment on that function.
export default function BookingConfirmedEmail({ booking, bookingsUrl }: BookingConfirmedEmailProps) {
  return (
    <EmailLayout preview={`${booking.providerName} confirmed your booking for ${booking.when}.`}>
      <Heading style={heading}>Your booking is confirmed</Heading>
      <Text style={paragraph}>Hi {booking.customerName || "there"},</Text>
      <Text style={paragraph}>
        {booking.providerName} accepted your request. You are booked in.
      </Text>
      <BookingDetails booking={booking} audience="customer" />
      <EmailButton href={bookingsUrl}>View booking</EmailButton>
    </EmailLayout>
  );
}

BookingConfirmedEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  bookingsUrl: "http://localhost:3000/dashboard/bookings",
} satisfies BookingConfirmedEmailProps;
