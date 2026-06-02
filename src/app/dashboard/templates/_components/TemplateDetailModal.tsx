"use client";

import { useState } from "react";
import { X, RefreshCw, Globe, AlertTriangle, CheckCircle2, Clock, Loader2, ExternalLink } from "lucide-react";
import { TemplateStatusBadge } from "./TemplateStatusBadge";
import { LANGUAGE_LABELS, CATEGORIES, relativeTime } from "../_lib/templateHelpers";
import type { Template } from "../_lib/templateHelpers";

const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  MARKETING:      { bg:"rgba(251,191,36,0.1)",  text:"#B45309", border:"rgba(251,191,36,0.3)" },
  UTILITY:        { bg:"rgba(99,102,241,0.08)", text:"#6366F1", border:"rgba(99,102,241,0.2)" },
  AUTHENTICATION: { bg:"rgba(26,20,17,0.05)",  text:"var(--text-muted)", border:"var(--border)" },
};

function BodyPreview({ text }: { text: string }) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-dark)", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) =>
        /^\{\{\d+\}\}$/.test(part)
          ? <span key={i} style={{ background: "rgba(56,0,8,0.08)", color: "var(--burgundy)", borderRadius: 3, padding: "0 4px", fontWeight: 700, fontSize: 13 }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}

interface Props {
  template:  Template | null;
  onClose:   () => void;
  onUpdated: (t: Template) => void;
}

export function TemplateDetailModal({ template, onClose, onUpdated }: Props) {
  const [refreshing,        setRefreshing]        = useState(false);
  const [refreshMsg,        setRefreshMsg]        = useState<string | null>(null);
  const [categoryChangeMsg, setCategoryChangeMsg] = useState<string | null>(null);

  if (!template) return null;

  const catStyle = CATEGORY_STYLE[template.category] ?? CATEGORY_STYLE.UTILITY;
  const catLabel = CATEGORIES.find(c => c.value === template.category)?.label ?? template.category;
  const langLabel = LANGUAGE_LABELS[template.language] ?? template.language;

  // Parse components
  const components = (template.components ?? []) as Array<{ type: string; text?: string; format?: string; buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }> }>;
  const headerComp = components.find(c => c.type === "HEADER");
  const bodyComp   = components.find(c => c.type === "BODY");
  const footerComp = components.find(c => c.type === "FOOTER");
  const buttonsComp= components.find(c => c.type === "BUTTONS");

  async function handleRefresh() {
    if (!template) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res  = await fetch(`/api/templates/${template.id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      onUpdated(data.template as Template);
      if (data.categoryChanged) {
        setCategoryChangeMsg(`Meta changed the category from ${data.previousCategory} → ${data.template.category}`);
        setRefreshMsg(null);
      } else {
        setRefreshMsg(`Status: ${data.template.status}`);
        setCategoryChangeMsg(null);
      }
    } catch (err) {
      setRefreshMsg((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(26,20,17,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, overflowY: "auto",
      }}
    >
      <div style={{
        background: "white", borderRadius: 18,
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        width: "100%", maxWidth: 620,
        display: "flex", flexDirection: "column",
        maxHeight: "90vh", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-dark)", wordBreak: "break-all" }}>
              {template.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <TemplateStatusBadge status={template.status} />
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "2px 8px", borderRadius: 99,
                background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`,
              }}>
                {catLabel}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                <Globe size={10} />
                {langLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 16, background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "var(--text-muted)", display: "flex", flexShrink: 0 }}
            onMouseOver={e => (e.currentTarget.style.background = "var(--cream-2)")}
            onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Status info */}
          {template.status === "rejected" && template.rejection_reason && (
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={15} style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#DC2626" }}>Rejected by Meta</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#DC2626" }}>{template.rejection_reason}</p>
              </div>
            </div>
          )}
          {template.status === "approved" && (
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(21,128,61,0.06)", border: "1px solid rgba(21,128,61,0.2)" }}>
              <CheckCircle2 size={15} style={{ color: "#15803D", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#15803D" }}>
                Approved by Meta{template.approved_at ? ` on ${new Date(template.approved_at).toLocaleDateString()}` : ""}. Ready to use in broadcasts.
              </p>
            </div>
          )}
          {template.status === "pending" && (
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Clock size={15} style={{ color: "#6366F1", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#6366F1" }}>
                Under review by Meta — usually takes a few minutes to hours. Click Refresh to check.
              </p>
            </div>
          )}

          {/* Category changed by Meta banner */}
          {categoryChangeMsg && (
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <AlertTriangle size={15} style={{ color: "#B45309", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#B45309" }}>Category changed by Meta</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#92400E" }}>{categoryChangeMsg}. This is normal — Meta auto-categorises templates based on content.</p>
              </div>
            </div>
          )}

          {/* Header */}
          {headerComp && (
            <Row label="Header">
              {headerComp.format === "TEXT" || headerComp.type === "HEADER" ? (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>
                  {headerComp.text ?? `${headerComp.format} (media uploaded at send time)`}
                </p>
              ) : (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{headerComp.format} media</span>
              )}
            </Row>
          )}

          {/* Body */}
          <Row label="Message body">
            <div style={{ background: "var(--cream)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
              <BodyPreview text={bodyComp?.text ?? template.body ?? ""} />
            </div>
          </Row>

          {/* Variable labels */}
          {template.variable_labels && Object.keys(template.variable_labels).length > 0 && (
            <Row label="Variable labels">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(template.variable_labels).map(([n, label]) => (
                  <span key={n} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(56,0,8,0.06)", border: "1px solid rgba(56,0,8,0.12)", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}>
                    <span style={{ fontFamily: "monospace", color: "var(--burgundy)", fontWeight: 700 }}>{`{{${n}}}`}</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <span style={{ color: "var(--text-dark)" }}>{label as string}</span>
                  </span>
                ))}
              </div>
            </Row>
          )}

          {/* Footer */}
          {footerComp?.text && (
            <Row label="Footer">
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{footerComp.text}</p>
            </Row>
          )}

          {/* Buttons */}
          {buttonsComp?.buttons && buttonsComp.buttons.length > 0 && (
            <Row label="Buttons">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {buttonsComp.buttons.map((btn, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--cream)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", minWidth: 80 }}>{btn.type.replace("_", " ")}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{btn.text}</span>
                    {(btn.url || btn.phone_number) && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{btn.url ?? btn.phone_number}</span>
                    )}
                  </div>
                ))}
              </div>
            </Row>
          )}

          {/* Meta info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {template.meta_template_id && (
              <Row label="Meta template ID">
                <code style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--cream)", padding: "3px 6px", borderRadius: 4 }}>
                  {template.meta_template_id}
                </code>
              </Row>
            )}
            <Row label="Submitted">
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                {relativeTime(template.submitted_at ?? template.created_at)}
              </p>
            </Row>
          </div>

          {refreshMsg && (
            <p style={{ margin: 0, fontSize: 12, color: refreshMsg.includes("updated") ? "#15803D" : "#DC2626" }}>
              {refreshMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          {template.meta_template_id ? (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 8, cursor: refreshing ? "not-allowed" : "pointer",
                border: "1.5px solid var(--border)", background: "white",
                fontSize: 13, fontWeight: 600, color: "var(--text-dark)",
                opacity: refreshing ? 0.6 : 1, transition: "border-color 0.15s",
              }}
              onMouseOver={e => { if (!refreshing) e.currentTarget.style.borderColor = "var(--text-mid)" }}
              onMouseOut={e  => { if (!refreshing) e.currentTarget.style.borderColor = "var(--border)" }}
            >
              {refreshing
                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <RefreshCw size={13} />
              }
              {refreshing ? "Checking…" : "Refresh status"}
            </button>
          ) : <div />}

          {template.status === "approved" && (
            <a
              href="/dashboard/broadcast"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--burgundy)", textDecoration: "none" }}
            >
              Use in broadcast <ExternalLink size={13} />
            </a>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "9px 22px", borderRadius: 8, cursor: "pointer",
              border: "none", background: "var(--text-dark)",
              fontSize: 13, fontWeight: 700, color: "white",
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
