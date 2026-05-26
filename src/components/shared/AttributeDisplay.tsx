"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface Props {
  attrKey:  string;
  value:    string;
  onEdit?:  (key: string, newValue: string) => Promise<void>;
  onDelete?:(key: string) => Promise<void>;
}

export function AttributeDisplay({ attrKey, value, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [saving,  setSaving]  = useState(false);
  const [hovered, setHovered] = useState(false);

  async function save() {
    if (!onEdit || draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onEdit(attrKey, draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSaving(true);
    try { await onDelete(attrKey); }
    finally { setSaving(false); }
  }

  return (
    <div
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         8,
        padding:     "6px 0",
        borderBottom:"1px solid var(--border)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 12, color: "#888", minWidth: 100, flexShrink: 0 }}>{attrKey}</span>

      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") { setDraft(value); setEditing(false); }
            }}
            onBlur={save}
            style={{
              flex:         1,
              padding:      "3px 8px",
              borderRadius: 6,
              border:       "1.5px solid var(--burgundy)",
              fontSize:     12,
              background:   "white",
              color:        "var(--text-dark)",
              outline:      "none",
            }}
          />
          <button type="button" onClick={save} disabled={saving}
            style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, color:"#15803D" }}>
            <Check size={13} />
          </button>
          <button type="button" onClick={() => { setDraft(value); setEditing(false); }}
            style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, color:"#DC2626" }}>
            <X size={13} />
          </button>
        </>
      ) : (
        <>
          <span
            style={{
              flex:         1,
              fontSize:     12,
              color:        "var(--text-dark)",
              background:   "var(--cream)",
              padding:      "3px 8px",
              borderRadius: 6,
              cursor:       onEdit ? "pointer" : "default",
            }}
            onClick={() => onEdit && setEditing(true)}
          >
            {value || <span style={{ color: "var(--text-muted)" }}>—</span>}
          </span>

          {hovered && (
            <div style={{ display: "flex", gap: 2 }}>
              {onEdit && (
                <button type="button" onClick={() => setEditing(true)}
                  style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, color:"var(--text-muted)" }}
                  onMouseOver={e=>(e.currentTarget.style.color="var(--text-dark)")}
                  onMouseOut={e =>(e.currentTarget.style.color="var(--text-muted)")}>
                  <Pencil size={11} />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={handleDelete} disabled={saving}
                  style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, color:"var(--text-muted)" }}
                  onMouseOver={e=>(e.currentTarget.style.color="#DC2626")}
                  onMouseOut={e =>(e.currentTarget.style.color="var(--text-muted)")}>
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
