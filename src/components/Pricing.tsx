"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLAN_DISPLAY, PLAN_FEATURES, type PlanName } from "@/lib/planLimits";

const PLANS: { name: PlanName; highlight: boolean; badge?: string; desc: string }[] = [
  { name: "free",    highlight: false, desc: "Start with no commitment. Free forever." },
  { name: "starter", highlight: true,  badge: "Most popular", desc: "Full automation suite for D2C brands." },
  { name: "growth",  highlight: false, desc: "For brands scaling fast with unlimited AI." },
  { name: "scale",   highlight: false, desc: "Enterprise-grade with dedicated support." },
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
            Simple pricing. No surprises.
          </h2>
          <p className="body-lg max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            Start free. Upgrade when you&apos;re ready. Every paid plan unlocks the full
            automation suite — broadcasts, Shopify, AI bot, and more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((plan, i) => {
            const display = PLAN_DISPLAY[plan.name];
            const features = PLAN_FEATURES[plan.name];
            return (
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
                    {display.label.replace(" Plan", "")}
                  </p>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: 26,
                        color: plan.highlight ? "var(--burgundy)" : "white",
                        lineHeight: 1,
                      }}
                    >
                      {display.priceNum === 0 ? "Free" : `₹${display.priceNum.toLocaleString("en-IN")}`}
                    </span>
                    {display.priceNum > 0 && (
                      <span style={{ fontSize: 12, color: plan.highlight ? "rgba(56,0,8,0.45)" : "rgba(255,255,255,0.35)" }}>
                        /month
                      </span>
                    )}
                  </div>

                  <p
                    className="body-sm"
                    style={{ color: plan.highlight ? "rgba(56,0,8,0.55)" : "rgba(255,255,255,0.35)" }}
                  >
                    {plan.desc}
                  </p>
                </div>

                <ul className="flex flex-col gap-3 flex-1">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 body-sm"
                      style={{ color: plan.highlight ? "rgba(56,0,8,0.75)" : "rgba(255,255,255,0.55)" }}
                    >
                      <span style={{ color: plan.highlight ? "var(--burgundy)" : "var(--accent)", fontWeight: 700, fontSize: 11, marginTop: 2, flexShrink: 0 }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className="btn mt-auto text-center"
                  style={{
                    background: plan.highlight ? "var(--burgundy)" : "rgba(255,255,255,0.08)",
                    color: "white",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "var(--radius-btn)",
                    textDecoration: "none",
                  }}
                >
                  {plan.name === "free" ? "Start for free →" : "Get started →"}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 body-sm"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          All paid plans include the full feature set. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
