import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="[date]">
      <p>
        By creating an account or using Doka, you agree to these terms. If you
        don&apos;t agree, please don&apos;t use Doka.
      </p>

      <h2>What Doka is</h2>
      <p>
        Doka is a platform where service providers list services and clients
        book them. Doka is not the provider of the services and is not a party
        to the agreement between a client and a provider.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 18 and give accurate information.</li>
        <li>You are responsible for your password and for activity on your account.</li>
        <li>You must verify your email address to use your account.</li>
      </ul>

      <h2>Providers</h2>
      <ul>
        <li>You are responsible for your services, prices, availability, and the quality of your work.</li>
        <li>You must honour bookings you accept, or cancel them in good time.</li>
        <li>Verification badges reflect the checks described in the app and are not a guarantee of quality.</li>
      </ul>

      <h2>Clients</h2>
      <ul>
        <li>Turn up on time for accepted bookings or cancel in good time.</li>
        <li>Reviews must be honest and based on a real booking.</li>
      </ul>

      <h2>Deposits, cancellations and refunds</h2>
      <p>
        [Describe how deposits are paid and held, who sets the cancellation
        rules, when a deposit is refunded, and any fee Doka charges.]
      </p>

      <h2>Not allowed</h2>
      <ul>
        <li>Fake listings, fake reviews, or impersonating others.</li>
        <li>Illegal services or content.</li>
        <li>Harassment, fraud, or attempts to break or misuse the platform.</li>
      </ul>

      <h2>Ending your account</h2>
      <p>
        You can delete your account at any time in your settings. We may
        suspend or remove accounts that break these terms.
      </p>

      <h2>Liability</h2>
      <p>
        Doka is provided &quot;as is&quot;. To the extent the law allows, we
        are not liable for disputes between clients and providers, or for
        losses from services booked through Doka. [Have a lawyer review this
        section.]
      </p>

      <h2>Governing law and contact</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of
        Nigeria. Questions: [contact email].
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continuing to use Doka after a change means
        you accept the new terms.
      </p>
    </LegalPage>
  );
}