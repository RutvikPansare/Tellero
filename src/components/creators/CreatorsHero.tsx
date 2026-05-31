"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ── Mini UI cards for each flow step ── */

function StepInstagramComment() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160 }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-4 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dark)" }}>Instagram</span>
      </div>
      <div className="rounded-lg p-2.5" style={{ background: "var(--cream-2)", border: "1px solid var(--border)" }}>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mb-1.5" />
        <div style={{ fontSize: 11, color: "var(--text-dark)", lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>@priya_fitness</span>
          <br />
          <span style={{ color: "var(--text-mid)" }}>Can you send me INFO? 🔥</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ background: "#E1306C" }} />
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 500 }}>1 new comment</span>
      </div>
    </div>
  );
}

function StepAutoDM() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160 }}>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dark)" }}>Auto DM</span>
        <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, background: "rgba(37,211,102,0.12)", color: "#25D366" }}>Instant</span>
      </div>
      <div className="rounded-lg p-2.5" style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", opacity: 0.92 }}>
        <div style={{ fontSize: 11, color: "white", lineHeight: 1.45 }}>
          Hey Priya! 👋 Thanks for your interest. Here&apos;s everything about my fitness program 💪
        </div>
      </div>
      <div className="flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span style={{ fontSize: 9, color: "#25D366", fontWeight: 600 }}>Sent in 0.3s</span>
      </div>
    </div>
  );
}

function StepWhatsApp() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160, background: "#ECE5DD" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#25D366" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.12-1.34A10 10 0 1012 2z"/></svg>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#075E54" }}>WhatsApp</span>
      </div>
      <div className="rounded-xl rounded-tl-none p-2.5 self-start" style={{ background: "white", fontSize: 11, color: "#111", lineHeight: 1.45, maxWidth: 140 }}>
        Yes! Tell me more about pricing 🙏
      </div>
      <div className="rounded-xl rounded-tr-none p-2.5 self-end" style={{ background: "#DCF8C6", fontSize: 11, color: "#111", lineHeight: 1.45, maxWidth: 140 }}>
        Sure! Here&apos;s your personalised plan 👇
      </div>
    </div>
  );
}

function StepLeadCaptured() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160 }}>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dark)" }}>Lead Captured</span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#25D366" }} />
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--cream-2)" }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex-shrink-0" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dark)" }}>Priya Sharma</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)" }}>+91 98765 43210</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Warm Lead", "Fitness"].map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 600, background: "rgba(37,211,102,0.1)", color: "#25D366", border: "1px solid rgba(37,211,102,0.25)" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function StepPipeline() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dark)", marginBottom: 2 }}>Pipeline Stage</span>
      {[
        { label: "New Lead", active: false },
        { label: "Interested", active: true },
        { label: "Discovery Call", active: false },
      ].map(({ label, active }) => (
        <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: active ? "rgba(37,211,102,0.08)" : "var(--cream-2)", border: active ? "1px solid rgba(37,211,102,0.3)" : "1px solid transparent" }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active ? "#25D366" : "var(--text-muted)" }} />
          <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#25D366" : "var(--text-muted)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function StepConverted() {
  return (
    <div className="card p-3 flex flex-col gap-2" style={{ minWidth: 160, background: "linear-gradient(145deg, #f0fff6, white)" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#25D366" }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#25D366" }}>Client Enrolled!</span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.2)" }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex-shrink-0" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dark)" }}>Priya Sharma</div>
          <div style={{ fontSize: 9, color: "#25D366", fontWeight: 600 }}>₹12,000 · Fitness Pro</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Enrolled 3 days after first comment</div>
    </div>
  );
}

const stepCards = [
  { card: <StepInstagramComment />, label: "Instagram Comment" },
  { card: <StepAutoDM />, label: "Auto DM" },
  { card: <StepWhatsApp />, label: "WhatsApp Conversation" },
  { card: <StepLeadCaptured />, label: "Lead Captured" },
  { card: <StepPipeline />, label: "Pipeline Stage" },
  { card: <StepConverted />, label: "Client Converted" },
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
        <div className="flex flex-wrap justify-center items-start gap-2 sm:gap-3">
          {stepCards.map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
              >
                {step.card}
              </motion.div>
              {i < stepCards.length - 1 && (
                <div className="hidden sm:flex items-center self-center">
                  <div className="w-4 h-[2px] rounded-full" style={{ background: "rgba(37,211,102,0.35)" }} />
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                    <path d="M1 1l4 4-4 4" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
