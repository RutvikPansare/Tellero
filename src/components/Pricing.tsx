"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Free Tier",
    price: "TBD",
    desc: "A zero-risk entry tier, planned for launch.",
    features: ["100 messages/month", "Basic broadcast", "Contact import", "WhatsApp Business API"],
    highlight: false,
  },
  {
    name: "Starter",
    price: "TBD",
    desc: "Full automation suite for D2C brands, coming soon.",
    features: ["500 msgs included", "All automations free", "Unlimited agents", "AI support bot", "COD confirmation", "Abandoned cart recovery", "Reorder reminders"],
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Growth",
    price: "TBD",
    desc: "For brands scaling fast — revenue analytics and AI scoring.",
    features: ["2,000 msgs included", "Everything in Starter", "Revenue dashboard", "Customer health scores", "RTO risk scoring", "Priority support"],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-burgundy py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label-lime mb-4">Pricing</p>
          <h2 className="heading-xl text-white mb-4">
            Priced to earn your trust first.
          </h2>
          <p className="body-lg max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            We&apos;re still finalising pricing with our early cohort. Join the waitlist
            and help us get it right — beta access is free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col gap-6 p-7"
              style={{
                borderRadius: "var(--radius-card)",
                background: plan.highlight ? "var(--lime)" : "rgba(255,255,255,0.05)",
                border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.09)",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{
                    background: "white",
                    color: "var(--burgundy)",
                    borderRadius: "var(--radius-pill)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <div>
                <p
                  className="label mb-3"
                  style={{ color: plan.highlight ? "rgba(56,0,8,0.45)" : "rgba(255,255,255,0.28)" }}
                >
                  {plan.name}
                </p>

                {/* TBD price badge */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="inline-flex items-center px-3 py-1 font-bold"
                    style={{
                      fontSize: 13,
                      background: plan.highlight ? "rgba(56,0,8,0.1)" : "rgba(255,255,255,0.1)",
                      color: plan.highlight ? "var(--burgundy)" : "rgba(255,255,255,0.6)",
                      borderRadius: "var(--radius-pill)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Pricing TBD
                  </span>
                </div>

                <p
                  className="body-sm"
                  style={{ color: plan.highlight ? "rgba(56,0,8,0.55)" : "rgba(255,255,255,0.35)" }}
                >
                  {plan.desc}
                </p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 body-sm"
                    style={{ color: plan.highlight ? "rgba(56,0,8,0.75)" : "rgba(255,255,255,0.55)" }}
                  >
                    <span style={{ color: plan.highlight ? "var(--burgundy)" : "var(--accent)", fontWeight: 700, fontSize: 11 }}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="btn mt-auto"
                style={{
                  background: plan.highlight ? "var(--burgundy)" : "rgba(255,255,255,0.08)",
                  color: "white",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "var(--radius-btn)",
                  textDecoration: "none",
                }}
              >
                Join the waitlist
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 body-sm"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          Pricing will be set collaboratively with our first 50 customers. Early members lock in the lowest rate.
        </motion.p>
      </div>
    </section>
  );
}
