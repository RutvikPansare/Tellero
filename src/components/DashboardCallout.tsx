"use client";

import { motion } from "framer-motion";

const rows = [
  { label: "from 43 recovered carts",    value: "₹34,200" },
  { label: "in prevented COD losses",    value: "₹12,600" },
  { label: "from reorder reminders",     value: "₹28,800" },
  { label: "from win-back campaigns",    value: "₹8,400"  },
];

export default function DashboardCallout() {
  return (
    <section className="section-black py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Revenue dashboard
          </p>
          <h2 className="heading-xl text-white mb-6">
            ₹84,000 generated
            <br />
            <span style={{ color: "var(--accent)" }}>this month.</span>
          </h2>
          <p className="body-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            That&apos;s what Tellero shows your brand every month — not messages
            sent, but rupees recovered, returned orders prevented, and repeat
            customers reactivated. Automatically.
          </p>
        </motion.div>

        {/* Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="card-dark"
          style={{ boxShadow: "0 0 80px rgba(37,211,102,0.08)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#111" }}
          >
            <div>
              <p className="label mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                Tellero Revenue Dashboard
              </p>
              <p className="body-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                May 2026 · All automations
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          </div>

          {/* Revenue rows */}
          <div style={{ background: "#0e0e0e" }}>
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="flex items-center justify-between px-6 sm:px-8 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="body-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {row.label}
                </span>
                <span className="font-semibold text-white text-base sm:text-lg">
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-6"
            style={{ background: "#0D2818", borderTop: "1px solid rgba(37,211,102,0.2)" }}
          >
            <div>
              <p className="label mb-1" style={{ color: "rgba(37,211,102,0.4)" }}>
                Total value generated
              </p>
              <p className="heading-lg" style={{ color: "var(--accent)" }}>
                ₹84,000
              </p>
            </div>
            <div className="text-right">
              <p className="body-sm mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                Subscription
              </p>
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                ₹799/month
              </p>
              <p
                className="heading-sm mt-1"
                style={{ color: "var(--accent)" }}
              >
                ROI: 10,513%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
