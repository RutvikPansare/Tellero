"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import type { Template, TemplateStatus } from "../_lib/templateHelpers";

const STATUS_OPTIONS: { value: TemplateStatus | "all"; label: string }[] = [
  { value: "all",      label: "All"       },
  { value: "approved", label: "Approved"  },
  { value: "pending",  label: "In review" },
  { value: "draft",    label: "Draft"     },
  { value: "rejected", label: "Rejected"  },
  { value: "paused",   label: "Paused"    },
];

interface Props {
  templates:     Template[];
  loading:       boolean;
  error:         string | null;
  searchQuery:   string;
  setSearchQuery:(v: string) => void;
  statusFilter:  TemplateStatus | "all";
  setStatusFilter:(v: TemplateStatus | "all") => void;
  onDelete?:     (id: string) => void;
  onRefresh?:    (id: string) => void;
  onNew:         () => void;
}

/* ── Loading skeleton ───────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{
          height: 180, borderRadius: 14, background: "white",
          border: "1px solid var(--border)", overflow: "hidden", position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)",
            animation: "shimmer 1.4s infinite",
          }} />
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────── */
function EmptyState({ filtered, onNew }: { filtered: boolean; onNew: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: "rgba(56,0,8,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 24,
      }}>
        {filtered ? "🔍" : "📋"}
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
        {filtered ? "No templates found" : "No templates yet"}
      </p>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text-muted)" }}>
        {filtered
          ? "Try adjusting your search or filter"
          : "Create your first WhatsApp message template"}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          style={{
            padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: "var(--text-dark)", color: "white", border: "none", cursor: "pointer",
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
        >
          Create template
        </button>
      )}
    </div>
  );
}

export function TemplateList({
  templates, loading, error,
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  onDelete, onRefresh, onNew,
}: Props) {
  const filtered = !!(searchQuery || statusFilter !== "all");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={14}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
          />
          <input
            style={{
              width: "100%", padding: "9px 14px 9px 34px",
              borderRadius: "var(--radius-btn)", border: "1.5px solid var(--border)",
              background: "white", fontSize: 13, color: "var(--text-dark)", outline: "none",
              transition: "border-color 0.2s", boxSizing: "border-box",
            }}
            placeholder="Search templates…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={e  => (e.currentTarget.style.borderColor = "var(--text-dark)")}
            onBlur={e   => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
          <SlidersHorizontal size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          {STATUS_OPTIONS.map(opt => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as TemplateStatus | "all")}
                style={{
                  padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${active ? "var(--text-dark)" : "var(--border)"}`,
                  background: active ? "var(--text-dark)" : "white",
                  color: active ? "white" : "var(--text-mid)",
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
          borderRadius: 10, padding: "12px 16px",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>Failed to load templates: {error}</p>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : templates.length === 0 ? (
        <EmptyState filtered={filtered} onNew={onNew} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
