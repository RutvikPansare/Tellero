"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const stats = [
  { number: "40%",    label: "projected COD return reduction" },
  { number: "₹30k",  label: "estimated recovery per brand/month" },
  { number: "30%",   label: "target repeat purchase uplift" },
];

const quote = {
  text: "We're onboarding our first cohort of D2C brands. Join the waitlist and help us build this right.",
  name: "Rutvik, Founder",
  brand: "Tellero · Building in public",
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const supabase = createClient();

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
        return;
      }
      // Supabase returns the Google OAuth URL — redirect manually
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setGoogleLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Session set — redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>

      {/* ── LEFT PANEL — Burgundy brand strip ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] flex-shrink-0 p-10 xl:p-14"
        style={{ background: "var(--burgundy)" }}
      >
        {/* Logo */}
        <a href="/" className="font-logo text-white" style={{ fontSize: 34, textDecoration: "none" }}>
          Tellero
        </a>

        {/* Center content */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="heading-xl text-white mb-4"
            style={{ maxWidth: 380 }}
          >
            Your WhatsApp list is a goldmine.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="body-lg mb-12"
            style={{ color: "rgba(255,255,255,0.45)", maxWidth: 340 }}
          >
            Tellero turns it into revenue — automatically, on WhatsApp.
          </motion.p>

          {/* Stat cards */}
          <div className="flex flex-col gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.28 + i * 0.1 }}
                className="flex items-center gap-5 p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span
                  className="heading-lg flex-shrink-0"
                  style={{ color: "var(--lime)", lineHeight: 1, minWidth: 80 }}
                >
                  {s.number}
                </span>
                <span className="body-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5" style={{ color: "var(--lime)" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="body-sm mb-4" style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(197,232,74,0.15)", color: "var(--lime)" }}
            >
              {quote.name[0]}
            </div>
            <div>
              <p className="body-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                {quote.name}
              </p>
              <p className="label" style={{ color: "rgba(255,255,255,0.3)" }}>{quote.brand}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ background: "var(--cream)" }}>

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <a href="/" className="font-logo" style={{ fontSize: 32, color: "var(--text-dark)", textDecoration: "none" }}>
            Tellero
          </a>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card w-full"
          style={{ maxWidth: 440, padding: "40px 40px 36px" }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg text-[var(--text-dark)] mb-2">Welcome back</h1>
            <p className="body-md">Sign in to your Tellero dashboard.</p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p style={{ fontSize: 13, color: "#EF4444" }}>{error}</p>
            </div>
          )}

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 mb-6 transition-colors"
            style={{
              padding: "13px 20px",
              borderRadius: "var(--radius-btn)",
              border: "1.5px solid var(--border)",
              background: "white",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-dark)",
              cursor: googleLoading ? "not-allowed" : "pointer",
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => !googleLoading && (e.currentTarget.style.background = "var(--cream)")}
            onMouseOut={(e)  => (e.currentTarget.style.background = "white")}
          >
            {googleLoading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} strokeOpacity={0.25} />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="label">or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="label" style={{ color: "var(--text-dark)" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "13px 16px",
                  borderRadius: "var(--radius-btn)",
                  border: "1.5px solid var(--border)",
                  background: "white",
                  fontSize: 14,
                  color: "var(--text-dark)",
                  outline: "none",
                  transition: "border-color 0.2s",
                  width: "100%",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-dark)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="label" style={{ color: "var(--text-dark)" }}>
                  Password
                </label>
                <a
                  href="#"
                  className="label"
                  style={{ color: "var(--text-mid)", textDecoration: "none" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-dark)")}
                  onMouseOut={(e)  => (e.currentTarget.style.color = "var(--text-mid)")}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    padding: "13px 44px 13px 16px",
                    borderRadius: "var(--radius-btn)",
                    border: "1.5px solid var(--border)",
                    background: "white",
                    fontSize: 14,
                    color: "var(--text-dark)",
                    outline: "none",
                    transition: "border-color 0.2s",
                    width: "100%",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-dark)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-full mt-2"
              style={{ position: "relative", opacity: loading ? 0.75 : 1 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} strokeOpacity={0.25} />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Continue →"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="body-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
            Want early access?{" "}
            <a
              href="/#waitlist"
              style={{ color: "var(--text-dark)", fontWeight: 600, textDecoration: "none" }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e)  => (e.currentTarget.style.textDecoration = "none")}
            >
              Join the waitlist
            </a>
          </p>
        </motion.div>

        {/* Footer note */}
        <p className="label text-center mt-8" style={{ color: "var(--text-muted)" }}>
          © 2026 Tellero · Made for Indian D2C brands 🇮🇳
        </p>
      </div>
    </div>
  );
}
