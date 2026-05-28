"use client";

import { useState } from "react";
import { X, Plus, Trash2, Check, Pencil } from "lucide-react";
import type { Tag } from "@/types/segments";

const COLORS = [
  "#E53E3E", "#DD6B20", "#D69E2E", "#38A169",
  "#3182CE", "#805AD5", "#D53F8C", "#718096",
];

interface Props {
  tags:       Tag[];
  onClose:    () => void;
  onCreate:   (name: string, color: string) => Promise<Tag>;
  onRename:   (tagId: string, name: string) => Promise<void>;
  onDelete:   (tagId: string) => Promise<void>;
}

export function ManageTagsModal({ tags, onClose, onCreate, onRename, onDelete }: Props) {
  const [newName,   setNewName]   = useState("");
  const [newColor,  setNewColor]  = useState(COLORS[0]);
  const [creating,  setCreating]  = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId,    setSavingId]    = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [actionErr,   setActionErr]   = useState<string | null>(null);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true); setCreateErr(null);
    try {
      await onCreate(name, newColor);
      setNewName(""); setNewColor(COLORS[0]);
    } catch (e) {
      setCreateErr((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(tagId: string) {
    const name = editingName.trim();
    if (!name) return;
    setSavingId(tagId); setActionErr(null);
    try {
      await onRename(tagId, name);
      setEditingId(null);
    } catch (e) {
      setActionErr((e as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(tagId: string) {
    setDeletingId(tagId); setActionErr(null);
    try {
      await onDelete(tagId);
    } catch (e) {
      setActionErr((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 50, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 51,
        background: "white", borderRadius: 16,
        width: "min(480px, calc(100vw - 32px))",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        maxHeight: "calc(100vh - 64px)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
            Manage Tags
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", display: "flex", borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Create new tag */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              Create new tag
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Color picker */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 20, height: 20, borderRadius: "50%", background: c,
                      border: newColor === c ? "2px solid var(--text-dark)" : "2px solid transparent",
                      cursor: "pointer", padding: 0, outline: "none",
                      boxShadow: newColor === c ? "0 0 0 2px white inset" : "none",
                    }}
                  />
                ))}
              </div>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                placeholder="Tag name…"
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 13,
                  color: "var(--text-dark)", outline: "none",
                  background: "var(--cream)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--text-dark)")}
                onBlur={e =>  (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: "none", background: "var(--text-dark)", color: "white",
                  cursor: !newName.trim() || creating ? "not-allowed" : "pointer",
                  opacity: !newName.trim() || creating ? 0.5 : 1, flexShrink: 0,
                }}
              >
                <Plus size={13} /> {creating ? "Creating…" : "Create"}
              </button>
            </div>
            {createErr && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#DC2626" }}>{createErr}</p>
            )}
          </div>

          {/* Tag list */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              {tags.length} tag{tags.length !== 1 ? "s" : ""}
            </p>

            {tags.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
                No tags yet. Create your first tag above.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {tags.map(tag => (
                  <div key={tag.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8,
                    background: "var(--cream-2)", border: "1px solid var(--border)",
                  }}>
                    {/* Color dot */}
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />

                    {/* Name / edit input */}
                    {editingId === tag.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleRename(tag.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        style={{
                          flex: 1, padding: "4px 8px", borderRadius: 6,
                          border: "1.5px solid var(--burgundy)", fontSize: 13,
                          color: "var(--text-dark)", outline: "none", background: "white",
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--text-dark)" }}>
                        {tag.name}
                      </span>
                    )}

                    {/* Contact count */}
                    {editingId !== tag.id && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                        {tag.contact_count ?? 0} contacts
                      </span>
                    )}

                    {/* Actions */}
                    {editingId === tag.id ? (
                      <button
                        onClick={() => handleRename(tag.id)}
                        disabled={savingId === tag.id}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#16A34A", padding: 4, display: "flex", borderRadius: 4 }}
                      >
                        <Check size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingId(tag.id); setEditingName(tag.name); setActionErr(null); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", borderRadius: 4 }}
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      style={{ background: "none", border: "none", cursor: "pointer", color: deletingId === tag.id ? "var(--text-muted)" : "#DC2626", padding: 4, display: "flex", borderRadius: 4 }}
                      title="Delete tag"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {actionErr && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#DC2626" }}>{actionErr}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
