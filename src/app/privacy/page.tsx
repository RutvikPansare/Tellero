import Nav    from "@/components/Nav";
import Footer from "@/components/Footer";

const LAST_UPDATED = "1 June 2026";

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information: When you sign up for Tellero we collect your name, email address, business name, and phone number.",
      "Shopify data: With your authorisation we access order data, customer phone numbers, and product information from your connected Shopify store to power automations and broadcasts.",
      "WhatsApp data: We store message content, delivery statuses, and conversation history processed through the Meta (WhatsApp) Business API on your behalf.",
      "Usage data: We collect information about how you interact with the Tellero dashboard — pages visited, features used, and actions taken — to improve the product.",
      "Payment data: Billing is handled by our payment processor (Razorpay / Stripe). We store only the last four digits of your card, billing address, and transaction receipts. We never store full card numbers.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "Providing the service: To send WhatsApp broadcasts, run automations, and populate your inbox and analytics.",
      "Customer support: To respond to queries, investigate issues, and resolve disputes.",
      "Product improvement: Aggregated, anonymised usage data helps us prioritise features and fix bugs.",
      "Legal compliance: To meet our obligations under applicable Indian and international law, including the Information Technology Act 2000 and DPDP Act 2023.",
      "Communications: Transactional emails (receipts, alerts, security notices) and, with your consent, product updates and marketing.",
    ],
  },
  {
    title: "3. Data Sharing",
    body: [
      "We do not sell your data. We share it only as described below:",
      "Meta (WhatsApp): Message content and recipient phone numbers are transmitted to Meta's servers to deliver WhatsApp messages. Meta's own privacy policy governs that processing.",
      "Shopify: We read data from your store. We do not write customer data back to Shopify except where explicitly part of a feature you enable.",
      "Infrastructure providers: We use Supabase (database & realtime), Vercel (hosting), and Resend (email). Each is bound by a Data Processing Agreement with us.",
      "Legal requests: We may disclose information if required by law, court order, or to protect rights, property, or safety.",
    ],
  },
  {
    title: "4. Data Retention",
    body: [
      "Account data is retained for the lifetime of your account and up to 90 days after deletion, to allow account recovery.",
      "WhatsApp message content is retained for 12 months by default. You may request earlier deletion from your Settings.",
      "Shopify order data synced to Tellero is retained while your Shopify integration is active and for 90 days after disconnection.",
      "Aggregated, anonymised analytics data may be retained indefinitely as it cannot be tied back to individuals.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "All data is encrypted in transit using TLS 1.2+ and at rest using AES-256.",
      "Access to production systems is restricted to authorised personnel via multi-factor authentication.",
      "We perform regular security reviews and promptly address vulnerabilities.",
      "In the event of a data breach affecting your personal data, we will notify you within 72 hours of becoming aware, as required by applicable law.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "Access: You may request a copy of the personal data we hold about you.",
      "Correction: You may update inaccurate information directly in your account settings or by contacting us.",
      "Deletion: You may delete your account and associated personal data from Settings → Account → Delete account. We will process deletion within 30 days.",
      "Portability: You may export your contacts, broadcast history, and message templates from the dashboard at any time.",
      "Opt-out: You may unsubscribe from marketing communications at any time via the link in any email we send.",
    ],
  },
  {
    title: "7. Cookies",
    body: [
      "We use strictly-necessary session cookies to keep you logged in and to protect against CSRF attacks.",
      "We do not use third-party advertising cookies.",
      "Analytics are collected server-side (Supabase) and do not require browser cookies.",
    ],
  },
  {
    title: "8. Children's Privacy",
    body: [
      "Tellero is a B2B SaaS platform intended for business users aged 18 and above. We do not knowingly collect personal data from minors. If you believe a minor has provided us data, please contact us immediately.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be communicated by email and/or a prominent notice in the dashboard at least 14 days before taking effect. Continued use of Tellero after the effective date constitutes acceptance of the revised policy.",
    ],
  },
  {
    title: "10. Contact Us",
    body: [
      "For privacy-related queries, data requests, or to exercise your rights, please contact:",
      "Email: privacy@tellero.in",
      "Registered address: Tellero Technologies Pvt. Ltd., India.",
      "We aim to respond to all requests within 7 business days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
          Legal
        </p>
        <h1 className="heading-lg" style={{ color: "white", marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 8 }}>
          Last updated: {LAST_UPDATED}
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
          Tellero (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting the privacy of our customers
          and their end-users. This policy explains what data we collect, why we collect it, and how we handle it.
          By using Tellero you agree to the practices described below.
        </p>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 760, margin: "40px auto 0 auto", padding: "0 24px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
      </div>

      {/* Sections */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 96px" }}>
        {sections.map((s) => (
          <div key={s.title} style={{ marginTop: 44 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 16, letterSpacing: "-0.01em" }}>
              {s.title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {s.body.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(56,0,8,0.9)", background: "rgba(197,232,74,0.15)", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                    ✓
                  </span>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  );
}
