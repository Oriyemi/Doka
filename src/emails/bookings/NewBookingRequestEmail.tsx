import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type NewBookingRequestEmailProps = {
  booking: BookingSummary;
  reviewUrl: string;
};

// To: the provider, when a customer books one of their services.
// Sent by: sendNewBookingRequestEmail in src/lib/email.ts.
// Not triggered anywhere yet. See the comment on that function.
export default function NewBookingRequestEmail({ booking, reviewUrl }: NewBookingRequestEmailProps) {
  return (
    <EmailLayout preview={`${booking.customerName} wants to book ${booking.serviceName}.`}>
      <Heading style={heading}>You have a new booking request</Heading>
      <Text style={paragraph}>Hi {booking.providerName || "there"},</Text>
      <Text style={paragraph}>
        {booking.customerName} wants to book {booking.serviceName}. Accept or decline the request
        so they know whether it is going ahead.
      </Text>
      <BookingDetails booking={booking} audience="provider" />
      <EmailButton href={reviewUrl}>Review request</EmailButton>
    </EmailLayout>
  );
}

NewBookingRequestEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada Obi",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  reviewUrl: "http://localhost:3000/provider/bookings",
} satisfies NewBookingRequestEmailProps;
