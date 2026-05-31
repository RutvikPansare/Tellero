"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const steps = [
  { num: 1, title: "Someone comments \"INFO\" on your post", icon: "💬" },
  { num: 2, title: "Auto DM sent instantly", icon: "⚡" },
  { num: 3, title: "Lead enters WhatsApp", icon: "📱" },
  { num: 4, title: "Lead tagged automatically", icon: "🏷️" },
  { num: 5, title: "Follow-up sequence starts", icon: "🔄" },
  { num: 6, title: "Lead moves through pipeline", icon: "📊" },
  { num: 7, title: "Lead becomes customer", icon: "🎉" },
];

export default function CreatorsSolution() {
  return (
    <section className="section-cream py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="label mb-4">The solution</p>
          <h2 className="heading-xl text-[var(--text-dark)]">
            From Comment to Client
          </h2>
        </motion.div>

        <div className="relative flex flex-col items-center gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center w-full max-w-md">
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card p-5 w-full flex items-center gap-4"
              >
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: "rgba(37,211,102,0.1)" }}
                >
                  {step.icon}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className="body-sm font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    {step.num}
                  </span>
                  <span className="body-md font-medium" style={{ color: "var(--text-dark)" }}>
                    {step.title}
                  </span>
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <div
                  className="w-0.5 h-6"
                  style={{ background: "var(--accent)", opacity: 0.4 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
