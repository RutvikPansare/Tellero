"use client";

import { Plus, RefreshCw } from "lucide-react";
import type { Template } from "../_lib/templateHelpers";

interface Props {
  templates:   Template[];
  syncing:     boolean;
  lastSynced:  Date | null;
  onSync:      () => void;
  onNew:       () => void;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)", borderRadius: 12,
      padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 90,
    }}>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
    </div>
  );
}

export function TemplatesHeader({ templates, syncing, lastSynced, onSync, onNew }: Props) {
  const approved = templates.filter(t => t.status === "approved").length;
  const pending  = templates.filter(t => t.status === "pending").length;
  const rejected = templates.filter(t => t.status === "rejected").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-dark)" }}>
            Message Templates
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            WhatsApp message templates for customer communications
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Sync button */}
          <button
            onClick={onSync}
            disabled={syncing}
            title={lastSynced ? `Last synced ${lastSynced.toLocaleTimeString()}` : "Sync template statuses"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10, cursor: syncing ? "not-allowed" : "pointer",
              border: "1.5px solid var(--border)", background: "white",
              fontSize: 13, fontWeight: 600, color: "var(--text-mid)",
              opacity: syncing ? 0.65 : 1, transition: "border-color 0.15s",
            }}
            onMouseOver={e => { if (!syncing) e.currentTarget.style.borderColor = "var(--text-dark)"; }}
            onMouseOut={e  => { if (!syncing) e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <RefreshCw size={13} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
            {syncing ? "Syncing…" : "Sync status"}
          </button>

          {/* New template */}
          <button
            onClick={onNew}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10, cursor: "pointer",
              border: "none", background: "var(--text-dark)",
              fontSize: 13, fontWeight: 700, color: "white",
              transition: "opacity 0.15s",
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} />
            New template
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total"     value={templates.length} color="var(--text-dark)" />
        <StatCard label="Approved"  value={approved}         color="#15803D"          />
        <StatCard label="In review" value={pending}          color="#B45309"          />
        <StatCard label="Rejected"  value={rejected}         color="#DC2626"          />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
