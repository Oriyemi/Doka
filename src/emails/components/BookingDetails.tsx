import { Column, Row, Section } from "react-email";
import { colors } from "./theme";

// What a booking email needs to know about a booking. The caller formats
// `when`, `duration` and `price` before passing them in, because only the
// caller knows the right time zone and currency.
export type BookingSummary = {
  serviceName: string;
  providerName: string;
  customerName: string;
  when: string;
  duration?: string;
  price?: string;
  reference?: string;
};

type BookingDetailsProps = {
  booking: BookingSummary;
  // Who is reading the email. A customer is shown the provider's name and a
  // provider is shown the customer's name.
  audience: "customer" | "provider";
};

// The summary box shared by every booking email.
export function BookingDetails({ booking, audience }: BookingDetailsProps) {
  const rows = [
    ["Service", booking.serviceName],
    audience === "customer"
      ? ["Provider", booking.providerName]
      : ["Customer", booking.customerName],
    ["When", booking.when],
    ["Duration", booking.duration],
    ["Price", booking.price],
    ["Reference", booking.reference],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <Section
      style={{
        margin: "8px 0 24px",
        padding: "8px 16px",
        backgroundColor: colors.primarySoft,
        borderRadius: "12px",
      }}
    >
      {rows.map(([label, value]) => (
        <Row key={label}>
          <Column
            style={{ width: "110px", padding: "8px 0", color: colors.muted, fontSize: "13px" }}
          >
            {label}
          </Column>
          <Column style={{ padding: "8px 0", color: colors.ink, fontSize: "14px", fontWeight: 600 }}>
            {value}
          </Column>
        </Row>
      ))}
    </Section>
  );
}
