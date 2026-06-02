"use client";

import { useState } from "react";
import { MoreHorizontal, Globe, RefreshCw, Trash2, CheckCircle2, Clock, XCircle, PauseCircle, FileText } from "lucide-react";
import { TemplateStatusBadge } from "./TemplateStatusBadge";
import { relativeTime, LANGUAGE_LABELS, CATEGORIES } from "../_lib/templateHelpers";
import type { Template } from "../_lib/templateHelpers";

const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  MARKETING:      { bg:"rgba(251,191,36,0.12)", text:"#92400E", border:"rgba(251,191,36,0.35)", dot:"#F59E0B" },
  UTILITY:        { bg:"rgba(99,102,241,0.08)", text:"#4338CA", border:"rgba(99,102,241,0.22)", dot:"#6366F1" },
  AUTHENTICATION: { bg:"rgba(20,184,166,0.08)", text:"#0F766E", border:"rgba(20,184,166,0.22)", dot:"#14B8A6" },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 size={13} style={{ color: "#16A34A" }} />,
  pending:  <Clock        size={13} style={{ color: "#6366F1" }} />,
  rejected: <XCircle      size={13} style={{ color: "#DC2626" }} />,
  paused:   <PauseCircle  size={13} style={{ color: "#D97706" }} />,
  draft:    <FileText      size={13} style={{ color: "var(--text-muted)" }} />,
};

/** Render body text with {{N}} variables highlighted */
function BodyPreview({ text }: { text: string }) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return (
    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)", wordBreak: "break-word" }}>
      {parts.map((part, i) =>
        /^\{\{\d+\}\}$/.test(part)
          ? <span key={i} style={{ background: "rgba(56,0,8,0.07)", color: "var(--burgundy)", borderRadius: 3, padding: "0 3px", fontWeight: 700, fontSize: 11 }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

interface Props {
  template:  Template;
  onDelete?: (id: string) => void;
  onRefresh?:(id: string) => void;
  onView?:   (t: Template) => void;
}

export function TemplateCard({ template, onDelete, onRefresh, onView }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const catStyle = CATEGORY_STYLE[template.category] ?? CATEGORY_STYLE.UTILITY;
  const catLabel = CATEGORIES.find(c => c.value === template.category)?.label ?? template.category;
  const bodyText = (template.body ?? "").slice(0, 120);
  const truncated= (template.body ?? "").length > 120;
  const canDelete= template.status === "rejected" || template.status === "draft";
  const langCode = (LANGUAGE_LABELS[template.language] ?? template.language).slice(0, 2).toUpperCase();

  return (
    <div
      onClick={() => onView?.(template)}
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 14,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 0.15s, border-color 0.15s, transform 0.15s",
      }}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)";
        e.currentTarget.style.borderColor = "rgba(26,20,17,0.2)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Coloured top accent bar */}
      <div style={{ height: 3, background: catStyle.dot, opacity: 0.7 }} />

      <div style={{ padding: "14px 16px 12px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Top row: name + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-dark)", lineHeight: 1.3, flex: 1, wordBreak: "break-all" }}>
            {template.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            {STATUS_ICON[template.status]}
            <TemplateStatusBadge status={template.status} />
          </div>
        </div>

        {/* Category pill */}
        <span style={{
          alignSelf: "flex-start",
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
          padding: "2px 8px", borderRadius: 99,
          background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`,
        }}>
          {catLabel}
        </span>

        {/* Body preview */}
        <div style={{
          background: "var(--cream)", borderRadius: 8, padding: "8px 10px",
          border: "1px solid var(--border)", flex: 1,
          minHeight: 48,
        }}>
          <BodyPreview text={bodyText} />
          {truncated && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>…</span>}
        </div>

        {/* Rejection reason */}
        {template.status === "rejected" && template.rejection_reason && (
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 7, padding: "5px 9px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#DC2626" }}>↳ {template.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px 10px", borderTop: "1px solid var(--border)",
        background: "var(--cream-2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            background: "var(--cream-3)", border: "1px solid var(--border)",
            borderRadius: 99, padding: "2px 7px",
          }}>
            <Globe size={9} />
            {langCode}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {relativeTime(template.submitted_at ?? template.created_at)}
          </span>
        </div>

        {/* Three-dot menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "3px 5px", borderRadius: 6, color: "var(--text-muted)",
              display: "flex", alignItems: "center",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "var(--cream-3)")}
            onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
              <div style={{
                position: "absolute", right: 0, bottom: "calc(100% + 4px)", zIndex: 50,
                background: "white", border: "1px solid var(--border)", borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 160, overflow: "hidden",
              }}>
                {[
                  { icon: RefreshCw, label: "Refresh status", action: () => { onRefresh?.(template.id); setMenuOpen(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={e => { e.stopPropagation(); action(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                      border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
                      color: "var(--text-dark)", textAlign: "left" }}
                    onMouseOver={e => (e.currentTarget.style.background = "var(--cream)")}
                    onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={13} style={{ color: "var(--text-muted)" }} />
                    {label}
                  </button>
                ))}
                {canDelete && (
                  <button onClick={e => { e.stopPropagation(); onDelete?.(template.id); setMenuOpen(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                      border: "none", borderTop: "1px solid var(--border)", background: "transparent",
                      cursor: "pointer", fontSize: 13, color: "#DC2626", textAlign: "left" }}
                    onMouseOver={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                    onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
