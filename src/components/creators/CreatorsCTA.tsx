"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function CreatorsCTA() {
  return (
    <section className="section-burgundy py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="heading-xl text-white mb-6"
        >
          Your Next Client Is Already In Your Comments
        </motion.h2>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="body-lg mb-10"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Capture every lead, automate every follow-up, and grow your creator
          business with Tellero.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a href="#waitlist" className="btn btn-lime w-full sm:w-auto">
            Start Free Trial →
          </a>
          <a href="#demo" className="btn btn-outline-white w-full sm:w-auto">
            Book Demo →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
