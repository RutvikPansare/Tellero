"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import MacbookMockup from "./MacbookMockup";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

/* Dashboard content shown inside the MacBook screen */
function DashboardScreen() {
  return (
    <Image
      src="/dashboard.png"
      alt="Tellero dashboard"
      width={1200}
      height={800}
      className="w-full h-auto"
      priority
    />
  );
}

export default function Hero() {
  return (
    <section className="section-cream relative min-h-screen flex flex-col items-center justify-center pt-24 pb-0 px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(26,20,17,0.14)] bg-white/70 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          <span className="label" style={{ color: "var(--text-dark)" }}>
            AI-native · Built for Indian D2C brands
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="heading-hero text-[var(--text-dark)] mb-6"
        >
          Revenue&apos;s secret{" "}
          <span className="text-[#25D366]">ingredient.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-lg max-w-[540px] mx-auto mb-10"
        >
          Meet the WhatsApp revenue engine built for Indian D2C brands. AI that
          cuts COD returns by 40%, recovers abandoned carts automatically, and
          reminds your customers to reorder — before they forget you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
        >
          <a href="#waitlist" className="btn btn-dark w-full sm:w-auto">
            Join the waitlist →
          </a>
          <a href="#features" className="btn btn-outline w-full sm:w-auto">
            See how it works →
          </a>
        </motion.div>

        {/* Micro proof */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="body-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Currently in private beta · 50+ brands on the waitlist · Free during beta
        </motion.p>
      </div>

      {/* MacBook mockup */}
      <motion.div
        initial={{ opacity: 0, y: 56 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className="relative z-10 mt-16 w-full max-w-4xl mx-auto"
      >
        <MacbookMockup>
          <DashboardScreen />
        </MacbookMockup>
      </motion.div>
    </section>
  );
}
