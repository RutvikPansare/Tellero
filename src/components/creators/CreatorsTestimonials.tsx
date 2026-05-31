"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const testimonials = [
  {
    stat: "3×",
    label: "more enrollments",
    quote:
      "Before Tellero, I was manually replying to DMs for hours. Now every comment on my transformation posts automatically becomes a lead in my pipeline. My enrollments tripled in two months.",
    persona: "Fitness Coach · Mumbai",
  },
  {
    stat: "₹2.4L",
    label: "revenue from comments",
    quote:
      "I launched my course and got 400+ comments saying 'interested'. Tellero captured every single one, sent auto-DMs, and nurtured them on WhatsApp. ₹2.4L in revenue from one Reel.",
    persona: "Course Creator · Delhi",
  },
  {
    stat: "80%",
    label: "faster response time",
    quote:
      "My response time went from 6 hours to under 2 minutes. Leads no longer go cold because Tellero follows up automatically. My coaching calendar is booked weeks in advance.",
    persona: "Business Mentor · Bangalore",
  },
];

export default function CreatorsTestimonials() {
  return (
    <section className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">What creators say</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Creators who stopped losing leads
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-7 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span
                    className="heading-lg"
                    style={{ color: "var(--burgundy)", lineHeight: 1 }}
                  >
                    {t.stat}
                  </span>
                  <span
                    className="body-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.label}
                  </span>
                </div>
                <p
                  className="body-md"
                  style={{ color: "var(--text-dark)", fontStyle: "italic" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div
                className="pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="body-sm"
                  style={{ color: "var(--text-muted)", fontSize: 12 }}
                >
                  — {t.persona}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
