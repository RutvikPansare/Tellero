import Nav    from "@/components/Nav";
import Footer from "@/components/Footer";

const LAST_UPDATED = "1 June 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By creating an account or using any part of the Tellero platform you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, you may not use Tellero.",
      "These terms form a binding agreement between you (the business or individual accessing Tellero) and Tellero Technologies Pvt. Ltd., a company incorporated in India.",
    ],
  },
  {
    title: "2. Description of Service",
    body: [
      "Tellero is a WhatsApp marketing and customer engagement platform for D2C (direct-to-consumer) brands. The service includes WhatsApp broadcast campaigns, automation workflows, a shared inbox, contact and segment management, and analytics.",
      "Tellero operates on top of the Meta WhatsApp Business API. Use of the platform is subject to Meta's WhatsApp Business Policy and Messaging Guidelines.",
      "We reserve the right to modify, suspend, or discontinue any feature of the service at any time with reasonable notice.",
    ],
  },
  {
    title: "3. Eligibility and Account",
    body: [
      "You must be at least 18 years old and have the legal capacity to enter contracts under applicable law.",
      "You must provide accurate, complete, and current registration information. You are responsible for maintaining the confidentiality of your account credentials.",
      "You are responsible for all activity that occurs under your account. If you suspect unauthorised access, notify us immediately at support@tellero.in.",
      "One account may be used by multiple team members. You must not share login credentials with people outside your organisation.",
    ],
  },
  {
    title: "4. Acceptable Use",
    body: [
      "You may only send WhatsApp messages to contacts who have opted in to receive communications from your brand, in accordance with Meta's policies and applicable Indian law including TRAI regulations.",
      "You must not use Tellero to send spam, unsolicited messages, misleading content, or messages that violate any applicable law.",
      "You must not use Tellero to promote illegal products or services, engage in phishing, spread malware, or harass individuals.",
      "You must not attempt to reverse-engineer, scrape, or extract data from the Tellero platform beyond what is available through our official APIs.",
      "Violation of acceptable use policies may result in immediate account suspension without refund.",
    ],
  },
  {
    title: "5. WhatsApp Compliance",
    body: [
      "You acknowledge that your use of WhatsApp through Tellero is governed by Meta's WhatsApp Business Policy. Violations of Meta's policies may result in your WhatsApp Business Account (WABA) being restricted or banned by Meta — a consequence outside Tellero's control.",
      "You are solely responsible for ensuring your message templates are approved by Meta prior to use in broadcasts.",
      "You must maintain an opt-in record for every contact you message. Tellero provides tools to manage opt-ins but the legal responsibility for compliance rests with you.",
    ],
  },
  {
    title: "6. Subscription and Payment",
    body: [
      "Tellero offers Free and paid subscription plans. Details of each plan, including message limits, are available on the Pricing page.",
      "Paid plans are billed monthly or annually in advance. All prices are in INR and exclusive of applicable taxes (GST).",
      "Subscriptions auto-renew unless cancelled before the renewal date. You may cancel at any time from Settings → Billing.",
      "Refunds are available within 7 days of a new paid subscription or annual renewal if you have not sent more than 100 messages in that billing period. Contact support@tellero.in to request a refund.",
      "We reserve the right to change pricing with 30 days' advance notice to existing subscribers.",
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      "All rights in the Tellero platform — including software, design, trademarks, and documentation — belong to Tellero Technologies Pvt. Ltd.",
      "You retain ownership of all content you upload or create in Tellero, including message templates, contact data, and broadcast campaigns.",
      "You grant Tellero a limited, non-exclusive licence to process your content solely for the purpose of providing the service.",
      "You may not use the Tellero name, logo, or brand assets without prior written permission.",
    ],
  },
  {
    title: "8. Data and Privacy",
    body: [
      "Our handling of personal data is described in the Privacy Policy, which is incorporated into these Terms by reference.",
      "You are the data controller for your customers' personal data processed through Tellero. Tellero acts as a data processor on your behalf.",
      "You are responsible for having a lawful basis to process your customers' data and for obtaining any required consents under applicable law, including the DPDP Act 2023.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      "Tellero is provided 'as is'. We do not warrant uninterrupted or error-free service, and we are not liable for losses arising from service outages, Meta API downtime, or third-party failures.",
      "To the maximum extent permitted by law, our total liability to you for any claim arising out of or related to these Terms shall not exceed the amount you paid to Tellero in the 3 months preceding the claim.",
      "We are not liable for indirect, incidental, consequential, or punitive damages, including lost revenue or lost profits, even if advised of the possibility.",
    ],
  },
  {
    title: "10. Termination",
    body: [
      "You may close your account at any time from Settings → Account. Upon closure your data will be retained for 90 days before permanent deletion, unless you request earlier deletion.",
      "We may suspend or terminate your account immediately if you breach these Terms, if your WABA is banned by Meta, or if required by law.",
      "Upon termination all licences granted to you cease immediately. Provisions that by their nature should survive termination (intellectual property, limitation of liability, dispute resolution) shall survive.",
    ],
  },
  {
    title: "11. Governing Law and Disputes",
    body: [
      "These Terms are governed by the laws of India. Any dispute shall first be attempted to be resolved through good-faith negotiation.",
      "If negotiation fails, disputes shall be submitted to binding arbitration under the Arbitration and Conciliation Act 1996, seated in Mumbai, conducted in English.",
      "Nothing in this clause prevents either party from seeking emergency injunctive relief from a court of competent jurisdiction.",
    ],
  },
  {
    title: "12. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Material changes will be communicated by email and/or a dashboard notice at least 14 days before taking effect.",
      "Continued use of Tellero after the effective date of updated Terms constitutes your acceptance. If you do not agree to the revised Terms, you must stop using Tellero before the effective date.",
    ],
  },
  {
    title: "13. Contact",
    body: [
      "Questions about these Terms? Contact us at: legal@tellero.in",
      "Registered address: Tellero Technologies Pvt. Ltd., India.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main style={{ background: "#0A0A0A", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
          Legal
        </p>
        <h1 className="heading-lg" style={{ color: "white", marginBottom: 12 }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 8 }}>
          Last updated: {LAST_UPDATED}
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
          Please read these Terms of Use carefully before using the Tellero platform. They describe your rights
          and responsibilities as a Tellero customer and the rules for using our service.
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
