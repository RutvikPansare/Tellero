"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ── Shared card shell ── */
function FlowCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        border: "1px solid rgba(26,20,17,0.07)",
        boxShadow: "0 4px 24px rgba(26,20,17,0.07), 0 1px 4px rgba(26,20,17,0.04)",
        padding: "14px 16px",
        width: 172,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Step 1: Instagram Comment ── */
function StepInstagramComment() {
  return (
    <FlowCard>
      {/* App bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17" cy="7" r="1.2" fill="white" stroke="none" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1411", lineHeight: 1 }}>Instagram</div>
          <div style={{ fontSize: 9, color: "#9C8F83", marginTop: 2 }}>1 new comment</div>
        </div>
        <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#E1306C" }} />
      </div>
      {/* Post thumbnail */}
      <div style={{
        borderRadius: 12, overflow: "hidden", height: 80,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex", alignItems: "flex-end", padding: 8,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
          borderRadius: 8, padding: "5px 8px",
          fontSize: 10, color: "white", fontWeight: 600,
        }}>
          🔥 New Batch Open
        </div>
      </div>
      {/* Comment bubble */}
      <div style={{
        background: "#F7F7F7", borderRadius: "10px 10px 10px 2px",
        padding: "7px 10px", fontSize: 11, color: "#1A1411", lineHeight: 1.4,
      }}>
        <span style={{ fontWeight: 700, color: "#bc1888" }}>@priya_fitness</span>
        <span style={{ color: "#555" }}> INFO please! 🙏</span>
      </div>
    </FlowCard>
  );
}

/* ── Step 2: Auto DM ── */
function StepAutoDM() {
  return (
    <FlowCard>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #1A1411, #3d2e28)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1411" }}>Auto DM</span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 99,
          background: "rgba(37,211,102,0.1)", color: "#25D366",
          border: "1px solid rgba(37,211,102,0.2)",
        }}>Instant</span>
      </div>
      {/* Message preview */}
      <div style={{
        background: "linear-gradient(135deg, #1A1411 0%, #2d2420 100%)",
        borderRadius: 12, padding: "10px 12px",
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Sending to @priya_fitness</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>
          Hey Priya! 👋 Thanks for your interest in my program. Here&apos;s the full details 💪
        </div>
      </div>
      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-5" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
        <span style={{ fontSize: 10, color: "#25D366", fontWeight: 600 }}>Delivered in 0.3s</span>
      </div>
    </FlowCard>
  );
}

/* ── Step 3: WhatsApp Chat ── */
function StepWhatsApp() {
  return (
    <FlowCard style={{ background: "#F0F2F5" }}>
      {/* Header */}
      <div style={{
        background: "#075E54", borderRadius: "20px 20px 0 0", padding: "8px 10px",
        display: "flex", alignItems: "center", gap: 8, margin: "-14px -16px 0", marginBottom: 0,
      }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #ec4899)", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>Priya Sharma</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>online</div>
        </div>
        <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.12-1.34A10 10 0 1012 2z"/></svg>
        </div>
      </div>
      {/* Bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        <div style={{ background: "white", borderRadius: "12px 12px 12px 3px", padding: "7px 10px", fontSize: 11, color: "#1A1411", lineHeight: 1.4, maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          Interested! What&apos;s the price? 🙏
        </div>
        <div style={{ background: "#DCF8C6", borderRadius: "12px 12px 3px 12px", padding: "7px 10px", fontSize: 11, color: "#1A1411", lineHeight: 1.4, maxWidth: "85%", alignSelf: "flex-end", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          Here&apos;s your personalised plan 👇
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 3 }}>
            <svg width="12" height="8" viewBox="0 0 16 10" fill="none"><path d="M1 5l3 3 5-7" stroke="#34B7F1" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 5l3 3 5-7" stroke="#34B7F1" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
    </FlowCard>
  );
}

/* ── Step 4: Lead Captured ── */
function StepLeadCaptured() {
  return (
    <FlowCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1411" }}>Lead Captured</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", boxShadow: "0 0 0 3px rgba(37,211,102,0.2)" }} />
          <span style={{ fontSize: 9, color: "#25D366", fontWeight: 600 }}>New</span>
        </div>
      </div>
      {/* Lead card */}
      <div style={{ background: "linear-gradient(135deg, #F4EFE3, #EDE7D7)", borderRadius: 12, padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #ec4899)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "white", fontWeight: 700 }}>P</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1411" }}>Priya Sharma</div>
            <div style={{ fontSize: 10, color: "#9C8F83" }}>+91 98765 43210</div>
          </div>
        </div>
      </div>
      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {["Warm Lead", "Fitness"].map(t => (
          <span key={t} style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(37,211,102,0.08)", color: "#25D366", border: "1px solid rgba(37,211,102,0.2)" }}>{t}</span>
        ))}
      </div>
    </FlowCard>
  );
}

/* ── Step 5: Pipeline ── */
function StepPipeline() {
  const stages = [
    { label: "New Lead", done: true },
    { label: "Interested", active: true },
    { label: "Discovery Call", done: false },
  ];
  return (
    <FlowCard>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1411" }}>Pipeline</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {stages.map(({ label, done, active }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 10,
            background: active ? "rgba(37,211,102,0.07)" : done ? "transparent" : "#F7F7F7",
            border: active ? "1px solid rgba(37,211,102,0.25)" : "1px solid transparent",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "#25D366" : active ? "rgba(37,211,102,0.15)" : "#E5DFD0",
              border: active ? "1.5px solid rgba(37,211,102,0.4)" : "none",
            }}>
              {done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366" }} />}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#25D366" : done ? "#9C8F83" : "#6B6157" }}>{label}</span>
          </div>
        ))}
      </div>
    </FlowCard>
  );
}

/* ── Step 6: Converted ── */
function StepConverted() {
  return (
    <FlowCard style={{ background: "linear-gradient(145deg, #f0fff8, white)", border: "1px solid rgba(37,211,102,0.18)", boxShadow: "0 4px 24px rgba(37,211,102,0.08), 0 1px 4px rgba(37,211,102,0.06)" }}>
      {/* Checkmark header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,211,102,0.35)" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#1A1411" }}>Enrolled! 🎉</div>
          <div style={{ fontSize: 9, color: "#25D366", fontWeight: 600 }}>3 days after first comment</div>
        </div>
      </div>
      {/* Revenue card */}
      <div style={{ background: "rgba(37,211,102,0.07)", borderRadius: 12, padding: "9px 12px", border: "1px solid rgba(37,211,102,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "white", fontWeight: 700 }}>P</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1411" }}>Priya Sharma</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#25D366" }}>₹12,000</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: "#9C8F83", fontWeight: 500 }}>Fitness Pro · 3-month program</div>
    </FlowCard>
  );
}

const stepCards = [
  <StepInstagramComment key="ig" />,
  <StepAutoDM key="dm" />,
  <StepWhatsApp key="wa" />,
  <StepLeadCaptured key="lead" />,
  <StepPipeline key="pipe" />,
  <StepConverted key="conv" />,
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
          Trusted by 200+ Indian creators · Free 14-day trial · No credit card required
        </motion.p>
      </div>

      {/* Visual flow */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 mt-20 w-full max-w-6xl mx-auto overflow-x-auto pb-2"
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, minWidth: "max-content", margin: "0 auto", padding: "0 16px" }}>
          {stepCards.map((card, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.55 + i * 0.09 }}
              >
                {card}
              </motion.div>
              {i < stepCards.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 6px", marginTop: -20 }}>
                  <div style={{ width: 20, height: 1.5, background: "linear-gradient(90deg, rgba(37,211,102,0.3), rgba(37,211,102,0.6))", borderRadius: 99 }} />
                  <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                    <path d="M1 1l5 4.5L1 10" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

