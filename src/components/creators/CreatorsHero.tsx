"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const steps = [
  { icon: "💬", label: "Instagram Comment" },
  { icon: "⚡", label: "Auto DM" },
  { icon: "📱", label: "WhatsApp Conversation" },
  { icon: "🎯", label: "Lead Captured" },
  { icon: "📊", label: "Pipeline Stage" },
  { icon: "✅", label: "Client Converted" },
];

export default function CreatorsHero() {
  return (
    <section className="section-cream relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(26,20,17,0.14)] bg-white/70 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          <span className="label" style={{ color: "var(--text-dark)" }}>
            AI-native · Built for Indian Creators
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="heading-hero text-[var(--text-dark)] mb-6"
        >
          Convert Instagram Comments Into{" "}
          <span className="text-[#25D366]">Paying Clients</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-lg max-w-[600px] mx-auto mb-10"
        >
          Automatically capture leads from Instagram comments, move them into
          WhatsApp, nurture them with automated follow-ups, and manage your
          entire pipeline from one dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
        >
          <a href="#waitlist" className="btn btn-dark w-full sm:w-auto">
            Start Free Trial →
          </a>
          <a href="#demo" className="btn btn-outline w-full sm:w-auto">
            Watch Demo →
          </a>
        </motion.div>

        {/* Micro proof */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="body-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Trusted by 200+ Indian creators · Free 14-day trial · No credit card
          required
        </motion.p>
      </div>

      {/* Visual flow */}
      <motion.div
        initial={{ opacity: 0, y: 56 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className="relative z-10 mt-16 w-full max-w-5xl mx-auto"
      >
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="card p-4 sm:p-5 flex flex-col items-center gap-2 min-w-[100px] sm:min-w-[120px]">
                <span className="text-2xl sm:text-3xl">{step.icon}</span>
                <span
                  className="body-sm text-center font-medium"
                  style={{ color: "var(--text-dark)", fontSize: 11 }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className="text-lg font-bold hidden sm:block"
                  style={{ color: "var(--accent)" }}
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
