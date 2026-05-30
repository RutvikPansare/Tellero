"use client";

import { useState } from "react";
import { Users, MoreHorizontal, Pencil, Trash2, Target } from "lucide-react";
import type { Segment, FilterCondition } from "@/types/segments";

interface Props {
  segment:  Segment;
  onEdit:   (seg: Segment) => void;
  onDelete: (id: string) => void;
  onClick:  (seg: Segment) => void;
}

/* ── Filter → human-readable label ──────────────────────────────── */
const FIELD_LABEL: Record<string, string> = {
  total_spent:    "Spend",
  total_orders:   "Orders",
  last_order_at:  "Last order",
  first_order_at: "First order",
  tag:            "Tag",
  not_tag:        "Not tagged",
  attribute:      "Attribute",
};

const OP_LABEL: Record<string, string> = {
  is:                "is",
  is_not:            "is not",
  equals:            "=",
  gt:                ">",
  lt:                "<",
  gte:               "≥",
  lte:               "≤",
  before:            "before",
  after:             "after",
  within_days:       "within",
  more_than_days_ago:"more than",
  contains:          "contains",
};

function filterLabel(f: FilterCondition): string {
  const field = FIELD_LABEL[f.field] ?? f.field;
  const op    = OP_LABEL[f.operator]  ?? f.operator;
  let val     = "";

  if (Array.isArray(f.value)) {
    val = f.value.join(", ");
  } else if (f.value !== null && f.value !== undefined && f.value !== "") {
    if (f.field === "total_spent") {
      val = `₹${Number(f.value).toLocaleString("en-IN")}`;
    } else if (f.operator === "within_days") {
      val = `${f.value}d`;
    } else if (f.operator === "more_than_days_ago") {
      val = `${f.value}d ago`;
    } else {
      val = String(f.value);
    }
  }

  return [field, op, val].filter(Boolean).join(" ");
}

/* ── Segment accent colour derived from name ─────────────────────── */
const ACCENT_PALETTE = [
  { bg: "rgba(56,0,8,0.08)",   color: "var(--burgundy)",   border: "rgba(56,0,8,0.15)"   },
  { bg: "rgba(99,102,241,0.1)",color: "#6366F1",            border: "rgba(99,102,241,0.2)"},
  { bg: "rgba(16,185,129,0.1)",color: "#059669",            border: "rgba(16,185,129,0.2)"},
  { bg: "rgba(245,158,11,0.1)",color: "#D97706",            border: "rgba(245,158,11,0.2)"},
  { bg: "rgba(59,130,246,0.1)",color: "#2563EB",            border: "rgba(59,130,246,0.2)"},
];
function accent(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/* ─────────────────────────────────────────────────────────────────── */

export function SegmentCard({ segment, onEdit, onDelete, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const a          = accent(segment.name);
  const filterCount = segment.filters.length;
  const lastCalc   = segment.last_calculated_at
    ? new Date(segment.last_calculated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;

  const visibleFilters = segment.filters.slice(0, 2);
  const extraCount     = filterCount - visibleFilters.length;

  return (
    <div
      onClick={() => onClick(segment)}
      style={{
        background:   "white",
        border:       "1px solid var(--border)",
        borderRadius: 14,
        cursor:       "pointer",
        overflow:     "visible",
        position:     "relative",
        display:      "flex",
        flexDirection:"column",
        transition:   "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
        fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = "rgba(26,20,17,0.2)";
        e.currentTarget.style.boxShadow   = "0 6px 20px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform   = "translateY(-1px)";
      }}
      onMouseOut={e  => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow   = "none";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Icon */}
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: a.bg, border: `1px solid ${a.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Target size={15} style={{ color: a.color }} />
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 700,
              color: "var(--text-dark)", lineHeight: 1.3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {segment.name}
            </p>
            {segment.description && (
              <p style={{
                margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)",
                lineHeight: 1.4,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {segment.description}
              </p>
            )}
          </div>

          {/* ⋯ menu */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 4, borderRadius: 6, color: "var(--text-muted)",
                display: "flex", marginTop: 2,
              }}
              onMouseOver={e => (e.currentTarget.style.background = "var(--cream-2)")}
              onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
                />
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
                  background: "white", border: "1px solid var(--border)", borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 140, overflow: "hidden",
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(segment); setMenuOpen(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text-dark)", textAlign: "left" }}
                    onMouseOver={e => (e.currentTarget.style.background = "var(--cream)")}
                    onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
                  >
                    <Pencil size={12} style={{ color: "var(--text-muted)" }} /> Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(segment.id); setMenuOpen(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "none", borderTop: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: 13, color: "#DC2626", textAlign: "left" }}
                    onMouseOver={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                    onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter pills */}
        {filterCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
            {visibleFilters.map(f => (
              <span
                key={f.id}
                style={{
                  fontSize: 11, fontWeight: 500,
                  padding: "3px 8px", borderRadius: 99,
                  background: "var(--cream-2)",
                  color: "var(--text-mid)",
                  border: "1px solid var(--border)",
                  whiteSpace: "nowrap", maxWidth: 180,
                  overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {filterLabel(f)}
              </span>
            ))}
            {extraCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "3px 8px", borderRadius: 99,
                background: a.bg, color: a.color,
                border: `1px solid ${a.border}`,
              }}>
                +{extraCount} more
              </span>
            )}
            {/* AND / OR badge */}
            <span style={{
              marginLeft: "auto",
              fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
              padding: "3px 8px", borderRadius: 99,
              background: segment.conjunction === "AND" ? "rgba(56,0,8,0.06)" : "rgba(99,102,241,0.1)",
              color: segment.conjunction === "AND" ? "var(--burgundy)" : "#6366F1",
              border: `1px solid ${segment.conjunction === "AND" ? "rgba(56,0,8,0.12)" : "rgba(99,102,241,0.2)"}`,
            }}>
              {segment.conjunction}
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--cream)",
        borderRadius: "0 0 14px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={12} style={{ color: "#15803D" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#15803D" }}>
            {segment.contact_count.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>contacts</span>
        </div>
        {lastCalc
          ? <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Updated {lastCalc}</span>
          : <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>Not calculated</span>
        }
      </div>
    </div>
  );
}
