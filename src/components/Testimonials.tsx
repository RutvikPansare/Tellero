"use client";

import { motion } from "framer-motion";

const problems = [
  {
    stat: "34%",
    label: "COD return rate",
    quote: "We get 200 COD orders a month. At least 60 come back. That's dead inventory, wasted logistics costs, and a customer we never hear from again.",
    persona: "Founder, skincare brand · Bangalore",
  },
  {
    stat: "₹0",
    label: "recovered from abandoned carts",
    quote: "I can see 150 abandoned carts in my Shopify dashboard every month. I have no way to reach those people. Email open rates are 8%. It's money just sitting there.",
    persona: "Co-founder, fashion D2C · Surat",
  },
  {
    stat: "1 in 8",
    label: "customers reorder without a nudge",
    quote: "We know our customers love the product — repurchase data shows it. But they forget. There's no system to remind them at the right moment.",
    persona: "Head of Growth, organic food brand · Pune",
  },
];

export default function Testimonials() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">Why we&apos;re building this</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Real problems we heard from{" "}
            <span style={{ color: "var(--text-mid)" }}>D2C founders.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-7 flex flex-col justify-between gap-6"
            >
              <div>
                {/* Stat highlight */}
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="heading-lg" style={{ color: "var(--burgundy)", lineHeight: 1 }}>{p.stat}</span>
                  <span className="body-sm font-semibold" style={{ color: "var(--text-muted)" }}>{p.label}</span>
                </div>
                <p className="body-md" style={{ color: "var(--text-dark)", fontStyle: "italic" }}>
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
              <div
                className="pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p className="body-sm" style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  — {p.persona}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
