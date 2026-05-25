import { TagBadge } from "@/components/shared/TagBadge";
import type { ContactWithTags } from "@/types/segments";

interface Props {
  contact:    ContactWithTags;
  selected:   boolean;
  onSelect:   (id: string, checked: boolean) => void;
  onClick:    (id: string) => void;
}

export function ContactRow({ contact, selected, onSelect, onClick }: Props) {
  const tags   = contact.contact_tags.map(ct => ct.tag);
  const shown  = tags.slice(0, 3);
  const extra  = tags.length - 3;

  const lastOrder = contact.last_order_at
    ? new Date(contact.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "—";

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border)",
        background:   selected ? "rgba(56,0,8,0.03)" : "transparent",
        cursor:       "pointer",
        transition:   "background 0.1s",
      }}
      onMouseOver={e => { if (!selected) e.currentTarget.style.background = "var(--cream)"; }}
      onMouseOut={e  => { e.currentTarget.style.background = selected ? "rgba(56,0,8,0.03)" : "transparent"; }}
    >
      {/* Checkbox */}
      <td style={{ padding: "12px 16px", width: 44 }} onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(contact.id, e.target.checked)}
          style={{ cursor: "pointer", accentColor: "var(--burgundy)" }}
        />
      </td>

      {/* Name + phone */}
      <td style={{ padding: "12px 16px" }} onClick={() => onClick(contact.id)}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-dark)" }}>
          {contact.name ?? "—"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          {contact.phone}
        </p>
      </td>

      {/* Tags */}
      <td style={{ padding: "12px 16px" }} onClick={() => onClick(contact.id)}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {shown.map(t => (
            <TagBadge key={t.id} name={t.name} color={t.color} size="sm" />
          ))}
          {extra > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              background: "var(--cream-2)", borderRadius: 99, padding: "1px 7px",
              border: "1px solid var(--border)",
            }}>
              +{extra}
            </span>
          )}
          {tags.length === 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
          )}
        </div>
      </td>

      {/* Orders */}
      <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={() => onClick(contact.id)}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mid)" }}>
          {contact.total_orders || "—"}
        </p>
      </td>

      {/* Spend */}
      <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={() => onClick(contact.id)}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mid)" }}>
          {contact.total_spent > 0 ? `₹${contact.total_spent.toLocaleString("en-IN")}` : "—"}
        </p>
      </td>

      {/* Last order */}
      <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={() => onClick(contact.id)}>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{lastOrder}</p>
      </td>
    </tr>
  );
}
