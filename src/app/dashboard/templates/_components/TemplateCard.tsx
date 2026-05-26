"use client";

import { useState } from "react";
import { MoreHorizontal, Globe, RefreshCw, Copy, Trash2, Eye } from "lucide-react";
import { TemplateStatusBadge } from "./TemplateStatusBadge";
import { relativeTime, LANGUAGE_LABELS, CATEGORIES } from "../_lib/templateHelpers";
import type { Template } from "../_lib/templateHelpers";

const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  MARKETING:      { bg:"rgba(251,191,36,0.1)",  text:"#B45309", border:"rgba(251,191,36,0.3)" },
  UTILITY:        { bg:"rgba(99,102,241,0.08)", text:"#6366F1", border:"rgba(99,102,241,0.2)" },
  AUTHENTICATION: { bg:"rgba(26,20,17,0.05)",  text:"var(--text-muted)", border:"var(--border)" },
};

/** Render body text with {{N}} variables highlighted */
function BodyPreview({ text }: { text: string }) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return (
    <p style={{ margin:0, fontSize:13, lineHeight:1.55, color:"var(--text-mid)", wordBreak:"break-word" }}>
      {parts.map((part, i) =>
        /^\{\{\d+\}\}$/.test(part)
          ? <span key={i} style={{ background:"rgba(56,0,8,0.08)", color:"var(--burgundy)", borderRadius:3, padding:"0 3px", fontWeight:600, fontSize:12 }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

interface Props {
  template:  Template;
  onDelete?: (id: string) => void;
  onRefresh?:(id: string) => void;
}

export function TemplateCard({ template, onDelete, onRefresh }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const catStyle = CATEGORY_STYLE[template.category] ?? CATEGORY_STYLE.UTILITY;
  const catLabel = CATEGORIES.find(c => c.value === template.category)?.label ?? template.category;
  const bodyText = (template.body ?? "").slice(0, 100);
  const truncated= (template.body ?? "").length > 100;
  const canDelete= template.status === "rejected" || template.status === "draft";

  return (
    <div
      className="card flex flex-col gap-0"
      style={{ cursor:"default", transition:"border-color 0.15s", position:"relative", overflow:"visible" }}
      onMouseOver={e => (e.currentTarget.style.borderColor = "rgba(26,20,17,0.18)")}
      onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ padding:"16px 16px 14px" }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)", margin:0, lineHeight:1.3, flex:1, wordBreak:"break-all" }}>
            {template.name}
          </p>
          <TemplateStatusBadge status={template.status} />
        </div>

        {/* Category badge */}
        <span style={{
          display:"inline-flex", fontSize:10, fontWeight:700, textTransform:"uppercase",
          letterSpacing:"0.08em", padding:"2px 8px", borderRadius:99,
          background:catStyle.bg, color:catStyle.text, border:`1px solid ${catStyle.border}`,
          marginBottom:10,
        }}>
          {catLabel}
        </span>

        {/* Body preview */}
        <div style={{ background:"var(--cream)", borderRadius:8, padding:"8px 10px", border:"1px solid var(--border)" }}>
          <BodyPreview text={bodyText} />
          {truncated && <span style={{ fontSize:12, color:"var(--text-muted)" }}>…</span>}
        </div>

        {/* Rejection reason */}
        {template.status === "rejected" && template.rejection_reason && (
          <div style={{ marginTop:8, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:8, padding:"6px 10px" }}>
            <p style={{ margin:0, fontSize:11, color:"#DC2626" }}>
              Reason: {template.rejection_reason}
            </p>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px", borderTop:"1px solid var(--border)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-muted)" }}>
            <Globe size={11} />
            {(LANGUAGE_LABELS[template.language] ?? template.language).toUpperCase().slice(0,2)}
          </span>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>
            {relativeTime(template.submitted_at ?? template.created_at)}
          </span>
        </div>

        {/* Three-dot menu */}
        <div style={{ position:"relative" }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, borderRadius:6,
              color:"var(--text-muted)", display:"flex", alignItems:"center" }}
            onMouseOver={e => (e.currentTarget.style.background="var(--cream-2)")}
            onMouseOut={e  => (e.currentTarget.style.background="transparent")}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={() => setMenuOpen(false)} />
              <div style={{
                position:"absolute", right:0, bottom:"calc(100% + 4px)", zIndex:50,
                background:"white", border:"1px solid var(--border)", borderRadius:10,
                boxShadow:"0 8px 24px rgba(0,0,0,0.1)", minWidth:160, overflow:"hidden",
              }}>
                {[
                  { icon:Eye,       label:"View details",   action:()=>{ setMenuOpen(false); } },
                  { icon:Copy,      label:"Duplicate",      action:()=>{ setMenuOpen(false); } },
                  { icon:RefreshCw, label:"Refresh status", action:()=>{ onRefresh?.(template.id); setMenuOpen(false); } },
                ].map(({ icon:Icon, label, action }) => (
                  <button key={label} onClick={action}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                      border:"none", background:"transparent", cursor:"pointer", fontSize:13,
                      color:"var(--text-dark)", textAlign:"left" }}
                    onMouseOver={e=>(e.currentTarget.style.background="var(--cream)")}
                    onMouseOut={e =>(e.currentTarget.style.background="transparent")}
                  >
                    <Icon size={13} style={{ color:"var(--text-muted)" }} />
                    {label}
                  </button>
                ))}
                {canDelete && (
                  <button onClick={()=>{ onDelete?.(template.id); setMenuOpen(false); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                      border:"none", borderTop:"1px solid var(--border)", background:"transparent",
                      cursor:"pointer", fontSize:13, color:"#DC2626", textAlign:"left" }}
                    onMouseOver={e=>(e.currentTarget.style.background="rgba(239,68,68,0.05)")}
                    onMouseOut={e =>(e.currentTarget.style.background="transparent")}
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
