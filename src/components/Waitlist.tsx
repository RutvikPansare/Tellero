"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate API call — replace with real endpoint later
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section id="waitlist" className="section-cream py-28 px-6">
      <div className="max-w-2xl mx-auto text-center">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Label */}
          <span
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 label"
            style={{
              background: "rgba(56,0,8,0.06)",
              borderRadius: "var(--radius-pill)",
              color: "var(--burgundy)",
              letterSpacing: "0.1em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                boxShadow: "0 0 0 3px rgba(37,211,102,0.2)",
              }}
            />
            Early access
          </span>

          <h2 className="heading-xl mb-5" style={{ color: "var(--text-dark)" }}>
            Be first when we launch.
          </h2>

          <p className="body-lg mb-10 max-w-lg mx-auto" style={{ color: "var(--text-mid)" }}>
            We&apos;re onboarding a small group of D2C brands to shape the product.
            Drop your email and we&apos;ll reach out within 24 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="heading-md" style={{ color: "var(--text-dark)" }}>You&apos;re on the list!</p>
                <p className="body-md" style={{ color: "var(--text-mid)" }}>
                  We&apos;ll email you at <strong style={{ color: "var(--text-dark)" }}>{email}</strong> within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbrand.com"
                    required
                    className="w-full"
                    style={{
                      padding: "14px 18px",
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                      borderRadius: "var(--radius-btn)",
                      border: error ? "1.5px solid #E53E3E" : "1.5px solid rgba(26,20,17,0.18)",
                      background: "white",
                      color: "var(--text-dark)",
                      outline: "none",
                      width: "100%",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { if (!error) e.target.style.borderColor = "rgba(26,20,17,0.4)"; }}
                    onBlur={(e) => { if (!error) e.target.style.borderColor = "rgba(26,20,17,0.18)"; }}
                  />
                  {error && (
                    <p style={{ position: "absolute", bottom: -20, left: 0, fontSize: 12, color: "#E53E3E" }}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-dark"
                  style={{
                    padding: "14px 24px",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    opacity: loading ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg
                        style={{ animation: "spin 0.8s linear infinite" }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                      >
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Joining…
                    </span>
                  ) : (
                    "Join the waitlist →"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!submitted && (
            <p className="body-sm mt-6" style={{ color: "var(--text-muted)" }}>
              No spam. No pitch decks. Just a genuine conversation.
            </p>
          )}
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-6 mt-14 flex-wrap"
        >
          {[
            { n: "50+", label: "brands on waitlist" },
            { n: "24 hrs", label: "response guarantee" },
            { n: "Free", label: "during beta" },
          ].map(({ n, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="heading-sm" style={{ color: "var(--text-dark)" }}>{n}</span>
              <span className="body-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </motion.div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
