import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[date]">
      <p>
        Doka  connects clients with service
        providers who offer bookable services. This policy explains what
        personal data we collect, why, and the choices you have.
      </p>

      <h2>Who we are</h2>
      <p>
        Doka, Benin city , Nigeria. Contact: oriyemiesan@gmail.com.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email address, and sign-in method (password or Google).</li>
        <li>Provider details: store name, location, services, prices, availability, and verification information you submit.</li>
        <li>Booking details: the service, date and time, and the people involved.</li>
        <li>Reviews you write.</li>
        <li>Technical data: IP address, browser and device type, and sign-in times, used for security and new-sign-in alerts.</li>
        <li>Payment information for deposits is handled by [payment provider]. We do not store card numbers.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To create your account and let you book or offer services.</li>
        <li>To send account emails: verification, password reset, sign-in alerts, and booking updates.</li>
        <li>To keep the platform secure and prevent abuse.</li>
        <li>To improve Doka using [analytics provider, if used].</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Providers see the name and booking details of clients who book them,
        and clients see a provider&apos;s store details and reviews. We use
        service providers to run Doka: hosting ([Vercel]), database ([Neon]),
        email delivery ([Resend]), and [payments and analytics]. We do not
        sell your personal data.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account is active. When you delete your
        account, we remove your account and store. Some booking records may be
        kept for [period] where needed for disputes or legal reasons.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct, or delete your data, object to certain uses,
        and withdraw consent. You can edit your profile and delete your
        account in your dashboard settings, or email us. You may also complain
        to the Nigeria Data Protection Commission.
      </p>

      <h2>Security</h2>
      <p>
        We use encrypted connections and secure sign-in sessions. No system is
        perfectly secure, so please use a strong, unique password.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we will update the date above and notify you
        of significant changes.
      </p>
    </LegalPage>
  );
}