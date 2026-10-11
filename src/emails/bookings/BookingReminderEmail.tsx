import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingReminderEmailProps = {
  booking: BookingSummary;
  // How far away the appointment is, for example "tomorrow" or "in 2 hours".
  startsIn: string;
  bookingsUrl: string;
};

// To: the customer, shortly before a confirmed booking starts.
// Sent by: sendBookingReminderEmail in src/lib/email.ts.
// Not triggered anywhere yet. This one needs a scheduled job. See the comment
// on that function.
export default function BookingReminderEmail({
  booking,
  startsIn,
  bookingsUrl,
}: BookingReminderEmailProps) {
  return (
    <EmailLayout preview={`${booking.serviceName} with ${booking.providerName} is ${startsIn}.`}>
      <Heading style={heading}>Your booking is {startsIn}</Heading>
      <Text style={paragraph}>Hi {booking.customerName || "there"},</Text>
      <Text style={paragraph}>
        A reminder that you are booked in with {booking.providerName}. If you can no longer make
        it, cancel from your bookings page so the slot can go to someone else.
      </Text>
      <BookingDetails booking={booking} audience="customer" />
      <EmailButton href={bookingsUrl}>View booking</EmailButton>
    </EmailLayout>
  );
}

BookingReminderEmail.PreviewProps = {
  booking: {
    serviceName: "Deep tissue massage",
    providerName: "Bisi Wellness",
    customerName: "Ada",
    when: "Mon 12 Oct 2026, 10:00",
    duration: "60 minutes",
    price: "NGN 25,000",
    reference: "DK-1042",
  },
  startsIn: "tomorrow",
  bookingsUrl: "http://localhost:3000/dashboard/bookings",
} satisfies BookingReminderEmailProps;
