"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const useCases = [
  {
    icon: "🎓",
    title: "Course Creators",
    description:
      "Capture leads from course launch posts, nurture with drip content, convert on autopilot.",
  },
  {
    icon: "💪",
    title: "Fitness Coaches",
    description:
      "Turn fitness transformation comments into discovery call bookings.",
  },
  {
    icon: "📈",
    title: "Business Coaches",
    description:
      "Qualify leads automatically and fill your coaching calendar.",
  },
  {
    icon: "💼",
    title: "Consultants",
    description:
      "Move high-intent prospects from comments to paid consultations.",
  },
  {
    icon: "🤝",
    title: "Community Builders",
    description:
      "Grow your paid community by capturing and nurturing interested followers.",
  },
  {
    icon: "🧠",
    title: "Mentors",
    description:
      "Book mentorship sessions from Instagram engagement without manual outreach.",
  },
];

export default function CreatorsUseCases() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">Use cases</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Built for every type of creator
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-7 flex flex-col gap-4"
            >
              <span className="text-3xl">{uc.icon}</span>
              <h3 className="heading-sm text-[var(--text-dark)]">{uc.title}</h3>
              <p className="body-sm" style={{ color: "var(--text-mid)" }}>
                {uc.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
