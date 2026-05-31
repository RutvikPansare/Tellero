"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const features = [
  {
    icon: "📸",
    title: "Instagram Comment Automation",
    description:
      "Auto-DM every interested prospect instantly. Never miss a lead from your Reels, carousels, or Stories.",
  },
  {
    icon: "📱",
    title: "WhatsApp Lead Capture",
    description:
      "Collect and organize leads automatically. Every prospect lands in your WhatsApp CRM with full context.",
  },
  {
    icon: "📊",
    title: "Lead Pipeline",
    description:
      "Track leads through stages: New Lead → Interested → Discovery Call → Proposal Sent → Enrolled",
  },
  {
    icon: "🏷️",
    title: "Lead Tags",
    description:
      "Segment your audience: Warm Lead, High Intent, Course Buyer, Fitness Goal, Business Owner",
  },
  {
    icon: "📣",
    title: "Broadcast Campaigns",
    description:
      "Send updates, launches, webinar reminders, and promotions to segmented lists.",
  },
  {
    icon: "🔄",
    title: "Lead Nurture Sequences",
    description:
      "Automatically follow up over days or weeks. No lead left behind.",
  },
];

export default function CreatorsFeatures() {
  return (
    <section id="features" className="section-cream-2 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="label mb-4">Platform</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Everything you need to convert followers into clients.
          </h2>
        </motion.div>

        <div className="bento-grid grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-8 flex flex-col gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(37,211,102,0.08)" }}
              >
                {f.icon}
              </div>
              <h3 className="heading-sm text-[var(--text-dark)]">{f.title}</h3>
              <p className="body-sm" style={{ color: "var(--text-mid)" }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
