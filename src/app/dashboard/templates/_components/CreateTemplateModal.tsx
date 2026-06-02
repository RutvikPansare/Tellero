"use client";

import { useEffect } from "react";
import { X, ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";
import { useCreateTemplate } from "../_hooks/useCreateTemplate";
import { StepBasicInfo } from "./steps/StepBasicInfo";
import { StepContent }   from "./steps/StepContent";
import { StepPreview }   from "./steps/StepPreview";

const STEPS = [
  { n: 1, label: "Basic info" },
  { n: 2, label: "Content"   },
  { n: 3, label: "Preview"   },
];

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export function CreateTemplateModal({ open, onClose, onSuccess }: Props) {
  const { state, dispatch, goNext, goBack, reset, handleSubmit } = useCreateTemplate(() => {
    onSuccess();
    onClose();
  });

  /* Lock body scroll when open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Reset on close */
  function handleClose() { reset(); onClose(); }

  if (!open) return null;

  const isLastStep = state.step === 3;
  const canGoBack  = state.step > 1;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(26,20,17,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Modal card */}
      <div style={{
        background: "white", borderRadius: 18,
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        width: "100%", maxWidth: 720,
        display: "flex", flexDirection: "column",
        maxHeight: "90vh", overflow: "hidden",
      }}>

        {/* ── Header ──────────────────────────────────────── */}
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>
              New message template
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Step {state.step} of 3 — {STEPS[state.step - 1].label}
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {STEPS.map((s, i) => {
              const done    = state.step > s.n;
              const active  = state.step === s.n;
              return (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: done || active ? "var(--burgundy)" : "var(--cream-2)",
                    color: done || active ? "white" : "var(--text-muted)",
                    transition: "all 0.2s",
                  }}>
                    {done ? "✓" : s.n}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: active ? "var(--burgundy)" : done ? "var(--text-mid)" : "var(--text-muted)",
                    display: "none", // hidden on small; show on medium
                  }}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 20, height: 1, background: done ? "var(--burgundy)" : "var(--border)", transition: "background 0.2s" }} />
                  )}
                </div>
              );
            })}

            <button
              onClick={handleClose}
              style={{
                marginLeft: 16, background: "transparent", border: "none",
                cursor: "pointer", padding: 6, borderRadius: 8,
                color: "var(--text-muted)", display: "flex", alignItems: "center",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "var(--cream-2)")}
              onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {state.step === 1 && <StepBasicInfo   state={state} dispatch={dispatch} />}
          {state.step === 2 && <StepContent      state={state} dispatch={dispatch} />}
          {state.step === 3 && <StepPreview      state={state} dispatch={dispatch} />}
        </div>

        {/* ── Submit error ─────────────────────────────────── */}
        {state.errors.submit && (
          <div style={{ padding: "10px 24px 0", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#DC2626", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, padding: "8px 12px" }}>
              {state.errors.submit}
            </p>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────── */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          {/* Back */}
          <button
            onClick={canGoBack ? goBack : handleClose}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 8, cursor: "pointer",
              border: "1.5px solid var(--border)", background: "white",
              fontSize: 13, fontWeight: 600, color: "var(--text-dark)",
              transition: "border-color 0.15s",
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = "var(--text-mid)")}
            onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            {canGoBack ? <ArrowLeft size={14} /> : null}
            {canGoBack ? "Back" : "Cancel"}
          </button>

          {/* Next / Submit */}
          {!isLastStep ? (
            <button
              onClick={goNext}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 22px", borderRadius: 8, cursor: "pointer",
                border: "none", background: "var(--text-dark)",
                fontSize: 13, fontWeight: 700, color: "white",
                transition: "opacity 0.15s",
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={state.isSubmitting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 22px", borderRadius: 8, cursor: state.isSubmitting ? "not-allowed" : "pointer",
                border: "none", background: "var(--burgundy)",
                fontSize: 13, fontWeight: 700, color: "white",
                opacity: state.isSubmitting ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
              onMouseOver={e => { if (!state.isSubmitting) e.currentTarget.style.opacity = "0.85"; }}
              onMouseOut={e  => { if (!state.isSubmitting) e.currentTarget.style.opacity = "1"; }}
            >
              {state.isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {state.isSubmitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
