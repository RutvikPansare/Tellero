"use client";

import { useState } from "react";
import { Users, MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react";
import type { Segment } from "@/types/segments";

interface Props {
  segment:  Segment;
  onEdit:   (seg: Segment) => void;
  onDelete: (id: string) => void;
  onClick:  (seg: Segment) => void;
}

export function SegmentCard({ segment, onEdit, onDelete, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const filterCount = segment.filters.length;
  const lastCalc    = segment.last_calculated_at
    ? new Date(segment.last_calculated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;

  return (
    <div
      className="card"
      onClick={() => onClick(segment)}
      style={{
        cursor:     "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position:   "relative",
        overflow:   "visible",
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = "rgba(26,20,17,0.22)";
        e.currentTarget.style.boxShadow   = "0 4px 16px rgba(0,0,0,0.07)";
      }}
      onMouseOut={e  => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow   = "none";
      }}
    >
      <div style={{ padding: "16px 16px 12px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-dark)", flex: 1, lineHeight: 1.3 }}>
            {segment.name}
          </p>
          <div style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, borderRadius:6, color:"var(--text-muted)", display:"flex" }}
              onMouseOver={e=>(e.currentTarget.style.background="var(--cream-2)")}
              onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <>
                <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={() => setMenuOpen(false)} />
                <div style={{
                  position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:50,
                  background:"white", border:"1px solid var(--border)", borderRadius:10,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.1)", minWidth:150, overflow:"hidden",
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(segment); setMenuOpen(false); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 14px", border:"none", background:"transparent", cursor:"pointer", fontSize:13, color:"var(--text-dark)", textAlign:"left" }}
                    onMouseOver={e=>(e.currentTarget.style.background="var(--cream)")}
                    onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
                    <Pencil size={12} style={{ color:"var(--text-muted)" }} /> Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(segment.id); setMenuOpen(false); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 14px", border:"none", borderTop:"1px solid var(--border)", background:"transparent", cursor:"pointer", fontSize:13, color:"#DC2626", textAlign:"left" }}
                    onMouseOver={e=>(e.currentTarget.style.background="rgba(239,68,68,0.05)")}
                    onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {segment.description && (
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            {segment.description}
          </p>
        )}

        {/* Conjunction badge */}
        <span style={{
          display: "inline-flex", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 99,
          background: segment.conjunction === "AND" ? "rgba(56,0,8,0.07)" : "rgba(99,102,241,0.1)",
          color: segment.conjunction === "AND" ? "var(--burgundy)" : "#6366F1",
          border: `1px solid ${segment.conjunction === "AND" ? "rgba(56,0,8,0.15)" : "rgba(99,102,241,0.2)"}`,
          marginBottom: 12,
        }}>
          {filterCount} filter{filterCount !== 1 ? "s" : ""} · {segment.conjunction}
        </span>
      </div>

      {/* Bottom row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderTop: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={13} style={{ color: "#15803D" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#15803D" }}>
            {segment.contact_count.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>contacts</span>
        </div>
        {lastCalc && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{lastCalc}</span>
          </div>
        )}
      </div>
    </div>
  );
}
