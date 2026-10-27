import { Heading, Text } from "react-email";
import { BookingDetails, type BookingSummary } from "../components/BookingDetails";
import { EmailButton } from "../components/EmailButton";
import { EmailLayout } from "../components/EmailLayout";
import { heading, paragraph } from "../components/theme";

export type BookingConfirmedEmailProps = {
  booking: BookingSummary;
  bookingsUrl: string;
  // Set only when the provider asks for a deposit that is not paid yet.
  // whatsappUrl is left out when the provider has no WhatsApp number saved.
  deposit?: { amount: string; whatsappUrl?: string };
};

// To: the customer, when the provider accepts their booking.
// Sent by: sendBookingConfirmedEmail in src/lib/email.ts.
export default function BookingConfirmedEmail({
  booking,
  bookingsUrl,
  deposit,
}: BookingConfirmedEmailProps) {
  return (
    <EmailLayout preview={`${booking.providerName} confirmed your booking for ${booking.when}.`}>
      <Heading style={heading}>Your booking is confirmed</Heading>
      <Text style={paragraph}>Hi {booking.customerName || "there"},</Text>
      <Text style={paragraph}>
        {booking.providerName} accepted your request. You are booked in.
      </Text>
      <BookingDetails booking={booking} audience="customer" />
      {deposit ? (
        <Text style={paragraph}>
          {booking.providerName} asks for a {deposit.amount} deposit.{" "}
          {deposit.whatsappUrl
            ? "Message them on WhatsApp to arrange payment."
            : "They will contact you to arrange payment."}{" "}
          Only pay the account details they give you in that chat, and keep your payment proof.
        </Text>
      ) : null}
      {deposit?.whatsappUrl ? (
        <EmailButton href={deposit.whatsappUrl}>Message provider on WhatsApp</EmailButton>
      ) : null}
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
  deposit: {
    amount: "NGN 5,000",
    whatsappUrl: "https://wa.me/2348012345678?text=Hi",
  },
} satisfies BookingConfirmedEmailProps;