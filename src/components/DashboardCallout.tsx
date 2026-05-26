"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function DashboardCallout() {
  return (
    <section className="section-black py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Revenue dashboard
          </p>
          <h2 className="heading-xl text-white mb-6">
            ₹84,000 generated
            <br />
            <span style={{ color: "var(--accent)" }}>this month.</span>
          </h2>
          <p className="body-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            That&apos;s what Tellero shows your brand every month — not messages
            sent, but rupees recovered, returned orders prevented, and repeat
            customers reactivated. Automatically.
          </p>
        </motion.div>

        {/* Dashboard screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="card-dark overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(37,211,102,0.08)" }}
        >
          <Image
            src="/dashboard.png"
            alt="Tellero revenue dashboard"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
