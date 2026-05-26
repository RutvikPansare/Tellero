"use client";

import { ContactRow } from "./ContactRow";
import type { ContactWithTags } from "@/types/segments";

interface Props {
  contacts:    ContactWithTags[];
  loading:     boolean;
  selectedIds: Set<string>;
  onSelect:    (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onClick:     (id: string) => void;
}

function LoadingSkeleton() {
  return (
    <>
      {[1,2,3,4,5].map(i => (
        <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
          {[44, 220, 160, 80, 100, 80].map((w, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div style={{ height: 14, width: w, borderRadius: 4, background: "var(--cream-2)" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding:     "10px 16px",
  fontSize:    11,
  fontWeight:  700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color:       "var(--text-muted)",
  whiteSpace:  "nowrap",
};

export function ContactsTable({
  contacts, loading, selectedIds, onSelect, onSelectAll, onClick,
}: Props) {
  const allSelected = contacts.length > 0 && contacts.every(c => selectedIds.has(c.id));

  return (
    <div style={{ overflowX: "auto", background: "white", border: "1px solid var(--border)", borderRadius: 14 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--cream)" }}>
            <th style={{ ...thStyle, width: 44 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => onSelectAll(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "var(--burgundy)" }}
              />
            </th>
            <th style={{ ...thStyle, textAlign: "left" }}>Contact</th>
            <th style={{ ...thStyle, textAlign: "left" }}>Tags</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Orders</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Spent</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Last order</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingSkeleton />
          ) : contacts.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>No contacts found</p>
              </td>
            </tr>
          ) : (
            contacts.map(c => (
              <ContactRow
                key={c.id}
                contact={c}
                selected={selectedIds.has(c.id)}
                onSelect={onSelect}
                onClick={onClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
