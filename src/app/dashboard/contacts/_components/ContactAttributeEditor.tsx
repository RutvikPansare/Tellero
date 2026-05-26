"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AttributeDisplay } from "@/components/shared/AttributeDisplay";

interface Props {
  contactId:  string;
  attributes: Record<string, string>;
  onSet:      (key: string, value: string) => Promise<void>;
  onDelete:   (key: string) => Promise<void>;
  onRefetch:  () => void;
}

export function ContactAttributeEditor({
  contactId, attributes, onSet, onDelete, onRefetch,
}: Props) {
  const [addKey,   setAddKey]   = useState("");
  const [addValue, setAddValue] = useState("");
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  void contactId;

  async function handleAdd() {
    if (!addKey.trim() || !addValue.trim()) return;
    setAdding(true); setError(null);
    try {
      await onSet(addKey.trim(), addValue.trim());
      setAddKey(""); setAddValue(""); setShowForm(false);
      onRefetch();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  const entries = Object.entries(attributes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {entries.length === 0 && !showForm && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No custom attributes yet</p>
      )}

      {entries.map(([k, v]) => (
        <AttributeDisplay
          key={k}
          attrKey={k}
          value={v}
          onEdit={async (key, newVal) => { await onSet(key, newVal); onRefetch(); }}
          onDelete={async (key) => { await onDelete(key); onRefetch(); }}
        />
      ))}

      {showForm ? (
        <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
          <input
            autoFocus
            placeholder="key"
            value={addKey}
            onChange={e => setAddKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            style={{
              flex: 1, padding: "5px 9px", borderRadius: 6,
              border: "1.5px solid var(--border)", fontSize: 12,
              background: "white", color: "var(--text-dark)", outline: "none",
            }}
          />
          <input
            placeholder="value"
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            style={{
              flex: 2, padding: "5px 9px", borderRadius: 6,
              border: "1.5px solid var(--border)", fontSize: 12,
              background: "white", color: "var(--text-dark)", outline: "none",
            }}
          />
          <button
            type="button" onClick={handleAdd} disabled={adding}
            style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              border: "none", background: "var(--text-dark)", color: "white",
              cursor: adding ? "not-allowed" : "pointer",
            }}
          >
            {adding ? "…" : "Add"}
          </button>
          <button
            type="button" onClick={() => { setShowForm(false); setAddKey(""); setAddValue(""); }}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 4, marginTop: 4,
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--text-muted)", padding: "4px 0",
          }}
          onMouseOver={e => (e.currentTarget.style.color = "var(--text-dark)")}
          onMouseOut={e  => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Plus size={11} /> Add attribute
        </button>
      )}

      {error && <p style={{ fontSize: 11, color: "#DC2626", margin: 0 }}>{error}</p>}
    </div>
  );
}
