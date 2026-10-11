import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingRequestReceivedEmailProps = {
  booking: BookingSummary;
  bookingsUrl: string;
};

// To: the customer, right after they submit a booking.
// Sent by: sendBookingRequestReceivedEmail in src/lib/email.ts.
// Not triggered anywhere yet. See the comment on that function.
export default function BookingRequestReceivedEmail({
  booking,
  bookingsUrl,
}: BookingRequestReceivedEmailProps) {
  return (
    <EmailLayout preview={`Your request for ${booking.serviceName} is with ${booking.providerName}.`}>
      <Heading style={heading}>We have your booking request</Heading>
      <Text style={paragraph}>Hi {booking.customerName || "there"},</Text>
      <Text style={paragraph}>
        Your request has gone to {booking.providerName}. The booking is not confirmed yet. We will
        email you as soon as they accept or decline.
      </Text>
      <BookingDetails booking={booking} audience="customer" />
      <EmailButton href={bookingsUrl}>View your bookings</EmailButton>
    </EmailLayout>
  );
}

BookingRequestReceivedEmail.PreviewProps = {
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
} satisfies BookingRequestReceivedEmailProps;
