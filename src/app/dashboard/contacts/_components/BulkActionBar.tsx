"use client";

import { useState } from "react";
import { Tag, Tags, Download, Trash2, X } from "lucide-react";
import type { Tag as TagType } from "@/types/segments";

interface Props {
  selectedIds:  string[];
  allTags:      TagType[];
  onAddTag:     (tagId: string) => Promise<void>;
  onRemoveTag:  (tagId: string) => Promise<void>;
  onExport:     () => void;
  onDelete:     () => Promise<void>;
  onClear:      () => void;
}

export function BulkActionBar({
  selectedIds, allTags, onAddTag, onRemoveTag, onExport, onDelete, onClear,
}: Props) {
  const [tagMenuOpen,   setTagMenuOpen]    = useState<"add" | "remove" | null>(null);
  const [actionLoading, setActionLoading]  = useState(false);

  const count = selectedIds.length;

  if (count === 0) return null;

  async function handleTagAction(tagId: string, action: "add" | "remove") {
    setActionLoading(true);
    setTagMenuOpen(null);
    try {
      if (action === "add")    await onAddTag(tagId);
      else                     await onRemoveTag(tagId);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${count} contact${count !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setActionLoading(true);
    try { await onDelete(); }
    finally { setActionLoading(false); }
  }

  return (
    <>
      {/* Click-away overlay for tag menus */}
      {tagMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setTagMenuOpen(null)} />
      )}

      <div style={{
        position:     "fixed",
        bottom:       24,
        left:         "50%",
        transform:    "translateX(-50%)",
        zIndex:       200,
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        background:   "var(--text-dark)",
        borderRadius: 14,
        padding:      "10px 14px",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.3)",
        color:        "white",
        fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
        whiteSpace:   "nowrap",
      }}>
        {/* Count */}
        <span style={{ fontSize: 13, fontWeight: 700, paddingRight: 8, borderRight: "1px solid rgba(255,255,255,0.2)", marginRight: 4 }}>
          {count} selected
        </span>

        {/* Add tag */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setTagMenuOpen(v => v === "add" ? null : "add")}
            disabled={actionLoading}
            style={{ ...btnStyle, gap: 5 }}
            onMouseOver={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}
            onMouseOut={e =>(e.currentTarget.style.background="transparent")}
          >
            <Tag size={13} /> Add tag
          </button>
          {tagMenuOpen === "add" && <TagMenu tags={allTags} onSelect={id => handleTagAction(id, "add")} />}
        </div>

        {/* Remove tag */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setTagMenuOpen(v => v === "remove" ? null : "remove")}
            disabled={actionLoading}
            style={btnStyle}
            onMouseOver={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}
            onMouseOut={e =>(e.currentTarget.style.background="transparent")}
          >
            <Tags size={13} /> Remove tag
          </button>
          {tagMenuOpen === "remove" && <TagMenu tags={allTags} onSelect={id => handleTagAction(id, "remove")} />}
        </div>

        {/* Export */}
        <button type="button" onClick={onExport} style={btnStyle}
          onMouseOver={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}
          onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
          <Download size={13} /> Export CSV
        </button>

        {/* Delete */}
        <button type="button" onClick={handleDelete} disabled={actionLoading}
          style={{ ...btnStyle, color: "#FCA5A5" }}
          onMouseOver={e=>(e.currentTarget.style.background="rgba(239,68,68,0.2)")}
          onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
          <Trash2 size={13} /> Delete
        </button>

        {/* Clear */}
        <button type="button" onClick={onClear}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", color: "rgba(255,255,255,0.5)", display: "flex", borderRadius: 6 }}
          onMouseOver={e=>(e.currentTarget.style.color="white")}
          onMouseOut={e =>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>
          <X size={14} />
        </button>
      </div>
    </>
  );
}

const btnStyle: React.CSSProperties = {
  display:      "flex",
  alignItems:   "center",
  gap:          5,
  padding:      "6px 10px",
  borderRadius: 8,
  border:       "none",
  background:   "transparent",
  color:        "white",
  fontSize:     12,
  fontWeight:   600,
  cursor:       "pointer",
};

function TagMenu({ tags, onSelect }: { tags: TagType[]; onSelect: (id: string) => void }) {
  return (
    <div style={{
      position:     "absolute",
      bottom:       "calc(100% + 8px)",
      left:         "50%",
      transform:    "translateX(-50%)",
      background:   "white",
      border:       "1px solid var(--border)",
      borderRadius: 10,
      boxShadow:    "0 8px 24px rgba(0,0,0,0.12)",
      minWidth:     160,
      overflow:     "hidden",
      zIndex:       201,
    }}>
      {tags.length === 0 && (
        <p style={{ padding: "10px 14px", margin: 0, fontSize: 12, color: "var(--text-muted)" }}>No tags</p>
      )}
      {tags.map(t => (
        <button key={t.id} type="button" onClick={() => onSelect(t.id)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", border: "none", background: "transparent",
            cursor: "pointer", fontSize: 12, color: "var(--text-dark)", textAlign: "left",
          }}
          onMouseOver={e=>(e.currentTarget.style.background="var(--cream)")}
          onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
          {t.name}
        </button>
      ))}
    </div>
  );
}
