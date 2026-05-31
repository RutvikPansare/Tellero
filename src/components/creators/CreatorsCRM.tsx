"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const dashboardElements = [
  { label: "Lead List", icon: "👥" },
  { label: "Tags", icon: "🏷️" },
  { label: "Custom Attributes", icon: "📝" },
  { label: "Pipeline Stages", icon: "📊" },
  { label: "Notes", icon: "📋" },
  { label: "Reminders", icon: "⏰" },
];

export default function CreatorsCRM() {
  return (
    <section className="section-cream py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="label mb-4">Your CRM</p>
          <h2 className="heading-xl text-[var(--text-dark)] mb-4">
            Your Creator CRM Inside WhatsApp
          </h2>
          <p className="body-lg max-w-[560px] mx-auto">
            No more Google Sheets, Notion databases, or manual tracking. Manage
            your entire sales process where your customers already are.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="card-cream p-8 sm:p-12 rounded-[var(--radius-card)]"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {dashboardElements.map((el, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="card p-5 flex flex-col items-center gap-3 text-center"
              >
                <span className="text-3xl">{el.icon}</span>
                <span
                  className="body-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {el.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
