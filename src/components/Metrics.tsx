"use client";

import { motion } from "framer-motion";

const metrics = [
  { label: "COD Confirmation",     number: "40%",     description: "Projected reduction in return-to-origin rate, based on industry benchmarks" },
  { label: "Abandoned Cart Recovery", number: "₹30,000", description: "Estimated monthly revenue recoverable per brand from abandoned carts" },
  { label: "Repeat Purchase Rate", number: "30%",     description: "Target uplift in reorder revenue from automated reminders" },
];

export default function Metrics() {
  return (
    <section className="section-burgundy py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="label-lime mb-4">Projected outcomes</p>
          <h2 className="heading-xl text-white max-w-xl">
            The numbers we&apos;re engineering for.
          </h2>
        </motion.div>

        {/* Metric cards — divided by subtle lines like nory */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-10 sm:p-12 flex flex-col gap-5"
              style={{
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                background: "var(--burgundy)",
              }}
            >
              <p className="label" style={{ color: "rgba(255,255,255,0.3)" }}>{m.label}</p>
              <p className="heading-hero" style={{ color: "var(--lime)", lineHeight: 1 }}>
                {m.number}
              </p>
              <p className="body-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {m.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
