"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ── Small screenshot placeholder — replace with real image ── */
function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="card-cream-inner w-full flex items-center justify-center p-6"
      style={{ minHeight: 220 }}
    >
      {/* PLACEHOLDER: Replace with actual product screenshot */}
      <p className="label text-center" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

/* ── Full-width feature card (text left, mockup right) ── */
function FeatureCardFull({
  label,
  stat,
  statLabel,
  headline,
  bullets,
  screenshotLabel,
  delay = 0,
  flip = false,
}: {
  label: string;
  stat: string;
  statLabel: string;
  headline: string;
  bullets: string[];
  screenshotLabel: string;
  delay?: number;
  flip?: boolean;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.55, delay }}
      className="card bento-full"
    >
      <div
        className={`flex flex-col lg:flex-row gap-0 ${
          flip ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Text side */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center gap-6">
          <p className="label">{label}</p>

          <div className="stat-badge self-start">
            <span
              className="heading-md text-[#25D366]"
              style={{ lineHeight: 1 }}
            >
              {stat}
            </span>
            <span className="body-sm" style={{ color: "var(--text-muted)" }}>
              {statLabel}
            </span>
          </div>

          <h3 className="heading-lg text-[var(--text-dark)]">{headline}</h3>

          <ul className="flex flex-col gap-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: "var(--cream-2)",
                    border: "1px solid rgba(26,20,17,0.1)",
                  }}
                >
                  <span
                    style={{ color: "#25D366", fontSize: 11, fontWeight: 700 }}
                  >
                    ✓
                  </span>
                </span>
                <span className="body-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Screenshot side */}
        <div
          className="flex-1 p-6 flex items-end"
          style={{ background: "var(--cream-2)", minHeight: 300 }}
        >
          <ScreenPlaceholder label={screenshotLabel} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Half-width feature card (stacked: text top, mockup bottom) ── */
function FeatureCardHalf({
  label,
  stat,
  statLabel,
  headline,
  description,
  screenshotLabel,
  delay = 0,
}: {
  label: string;
  stat: string;
  statLabel: string;
  headline: string;
  description: string;
  screenshotLabel: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.55, delay }}
      className="card flex flex-col"
    >
      <div className="p-8 sm:p-10 flex flex-col gap-5">
        <p className="label">{label}</p>

        <div className="stat-badge self-start">
          <span
            className="heading-md text-[#25D366]"
            style={{ lineHeight: 1 }}
          >
            {stat}
          </span>
          <span className="body-sm" style={{ color: "var(--text-muted)" }}>
            {statLabel}
          </span>
        </div>

        <h3 className="heading-sm text-[var(--text-dark)]">{headline}</h3>
        <p className="body-sm">{description}</p>
      </div>

      {/* Screenshot area */}
      <div className="p-6 pt-0">
        <ScreenPlaceholder label={screenshotLabel} />
      </div>
    </motion.div>
  );
}

export default function FeatureTabs() {
  return (
    <section id="features" className="section-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="label mb-4">Platform</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-2xl">
            Stop losing money to problems you can&apos;t see.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="bento-grid grid-cols-1 md:grid-cols-2">
          {/* Row 1 — full width */}
          <FeatureCardFull
            label="COD Returns"
            stat="40%"
            statLabel="avg. RTO reduction"
            headline="Cut COD returns from 35% to under 10%."
            bullets={[
              "Every COD order triggers an automatic WhatsApp confirmation",
              "Customer replies YES to confirm or NO to cancel instantly",
              "High-risk orders flagged by AI before dispatch",
              "Saves brands ₹8,000–15,000/month in reverse logistics",
            ]}
            screenshotLabel="COD confirmation automation — order list with AI risk scores and confirmation toggle"
            delay={0.05}
          />

          {/* Row 2 — two half cards */}
          <FeatureCardHalf
            label="Abandoned Carts"
            stat="₹30k"
            statLabel="recovered per month"
            headline="Recover 35–45% of abandoned carts automatically."
            description="Shopify detects the exit. Tellero waits 1 hour, checks if they purchased, and if not — sends a personalized WhatsApp with their exact cart. Recovers ₹25,000–40,000 monthly."
            screenshotLabel="Abandoned cart automation config — timing controls, message preview, conversion stats"
            delay={0.1}
          />

          <FeatureCardHalf
            label="Reorder Revenue"
            stat="30%"
            statLabel="repeat purchase lift"
            headline="Remind customers to reorder before they forget."
            description="Set replenishment cycles per product — 25 days for skincare, 30 for supplements. Customers get a personal WhatsApp at exactly the right time, every time."
            screenshotLabel="Reorder reminder settings — cycle selector, product categories, open rates"
            delay={0.15}
          />

          {/* Row 3 — full width, flipped */}
          <FeatureCardFull
            label="Customer Intelligence"
            stat="2.4×"
            statLabel="win-back success rate"
            headline="Know which customers are about to churn — before they do."
            bullets={[
              "Customer health scores updated daily, automatically",
              "AI flags customers showing early churn signals",
              "One-click win-back campaign to at-risk segments",
              "Revenue dashboard shows ₹ generated by Tellero this month",
            ]}
            screenshotLabel="Customer health dashboard — green/yellow/red scores with churn prediction and win-back launcher"
            delay={0.2}
            flip
          />
        </div>
      </div>
    </section>
  );
}
