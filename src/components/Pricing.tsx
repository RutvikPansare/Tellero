"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Free Forever",
    price: "₹0",
    desc: "Start selling smarter, zero risk.",
    features: ["100 messages/month","Basic broadcast","Contact import","WhatsApp Business API"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Starter",
    price: "₹799",
    desc: "Everything you need to start automating revenue.",
    features: ["500 msgs included","All automations free","Unlimited agents","AI support bot","COD confirmation","Abandoned cart recovery","Reorder reminders"],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Growth",
    price: "₹1,299",
    desc: "For brands scaling fast and tracking every rupee.",
    features: ["2,000 msgs included","Everything in Starter","Revenue dashboard","Customer health scores","RTO risk scoring","Priority support"],
    cta: "Start free trial",
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
            Priced for D2C brands from day one.
          </h2>
          <p className="body-lg max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            No hidden fees. No per-agent costs. No markup above 14%.
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
              className={`relative flex flex-col gap-6 p-7 ${
                plan.highlight ? "" : ""
              }`}
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
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="heading-xl"
                    style={{ color: plan.highlight ? "var(--burgundy)" : "white", lineHeight: 1 }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="body-sm"
                    style={{ color: plan.highlight ? "rgba(56,0,8,0.4)" : "rgba(255,255,255,0.28)" }}
                  >
                    /month
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
                href="#"
                className="btn mt-auto"
                style={{
                  background: plan.highlight ? "var(--burgundy)" : "rgba(255,255,255,0.08)",
                  color: plan.highlight ? "white" : "white",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "var(--radius-btn)",
                }}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
