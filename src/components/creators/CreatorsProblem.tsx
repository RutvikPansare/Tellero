"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const painPoints = [
  "You wake up to 200+ comments and can't reply to everyone.",
  "Hot leads disappear in your DMs within hours.",
  "You forget who asked about your course last week.",
  "Follow-ups happen manually — or not at all.",
  "Your CRM is a Google Sheet you haven't opened in days.",
  "Leads go cold because your response time is too slow.",
];

export default function CreatorsProblem() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">The problem</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Sound familiar?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-7 flex items-start gap-4"
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "rgba(56,0,8,0.06)",
                  color: "var(--burgundy)",
                }}
              >
                {i + 1}
              </span>
              <p
                className="body-md"
                style={{ color: "var(--text-dark)", fontStyle: "italic" }}
              >
                &ldquo;{point}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
