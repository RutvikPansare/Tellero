"use client";

import { useEffect } from "react";
import { X, MessageCircle, Trash2, Mail, ShoppingBag, Megaphone } from "lucide-react";
import { useContact }            from "../_hooks/useContact";
import { useContactTags }        from "../_hooks/useContactTags";
import { useContactAttributes }  from "../_hooks/useContactAttributes";
import { ContactTagEditor }      from "./ContactTagEditor";
import { ContactAttributeEditor} from "./ContactAttributeEditor";
import type { Tag } from "@/types/segments";

interface Props {
  contactId: string | null;
  onClose:   () => void;
  onDeleted: () => void;
}

const ROW_LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "var(--text-muted)", margin: "0 0 8px",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={ROW_LABEL}>{title}</p>
      {children}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "var(--cream)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px 14px",
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
        {label}
      </p>
      <p style={{ margin: "5px 0 0", fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
        {value}
      </p>
    </div>
  );
}

export function ContactDetailModal({ contactId, onClose, onDeleted }: Props) {
  const { contact, loading, refetch } = useContact(contactId);
  const { allTags, addTag, removeTag, createTag } = useContactTags();
  const { setAttribute, deleteAttribute } = useContactAttributes();

  useEffect(() => {
    if (contactId) document.body.style.overflow = "hidden";
    else           document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [contactId]);

  if (!contactId) return null;

  const contactTags: Tag[] = contact?.contact_tags.map(ct => ct.tag) ?? [];
  const attrs: Record<string, string> = (contact?.attributes as Record<string, string>) ?? {};

  async function handleAddTag(tagId: string)  { await addTag(contactId!, tagId);    refetch(); }
  async function handleRemoveTag(tagId: string){ await removeTag(contactId!, tagId); refetch(); }
  async function handleCreateTag(name: string, color: string): Promise<Tag> {
    return createTag(name, color);
  }

  async function handleDelete() {
    if (!confirm("Remove this contact? This cannot be undone.")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await (supabase as any).from("contacts").delete().eq("id", contactId);
    onDeleted();
    onClose();
  }

  const waLink    = contact ? `https://wa.me/${contact.phone.replace(/\D/g, "")}` : "#";
  const initials  = contact?.name
    ? contact.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : contact?.phone.slice(-2) ?? "?";

  const aov = contact && contact.total_orders > 0
    ? `₹${Math.round(contact.total_spent / contact.total_orders).toLocaleString("en-IN")}`
    : "—";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(26,20,17,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 18,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          width: "100%", maxWidth: 580,
          display: "flex", flexDirection: "column",
          maxHeight: "90vh", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: "rgba(56,0,8,0.08)", border: "1.5px solid rgba(56,0,8,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "var(--burgundy)",
          }}>
            {loading ? "…" : initials}
          </div>

          {/* Name / phone / email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ height: 18, width: 140, borderRadius: 4, background: "var(--border)" }} />
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-dark)", wordBreak: "break-word" }}>
                  {contact?.name ?? "Unknown"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-muted)" }}>
                    <MessageCircle size={12} />
                    {contact?.phone}
                  </span>
                  {contact?.email && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-muted)" }}>
                      <Mail size={12} />
                      {contact.email}
                    </span>
                  )}
                  <a
                    href={waLink}
                    target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#25D366", textDecoration: "none" }}
                  >
                    Open in WhatsApp ↗
                  </a>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "var(--text-muted)", display: "flex", flexShrink: 0 }}
            onMouseOver={e => (e.currentTarget.style.background = "var(--cream-2)")}
            onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[80, 120, 60].map(w => (
                <div key={w} style={{ height: 14, width: w, borderRadius: 4, background: "var(--border)" }} />
              ))}
            </div>
          )}

          {!loading && contact && (
            <>
              {/* Tags */}
              <Section title="Tags">
                <ContactTagEditor
                  contactId={contactId!}
                  contactTags={contactTags}
                  allTags={allTags}
                  onAdd={handleAddTag}
                  onRemove={handleRemoveTag}
                  onCreateNew={handleCreateTag}
                />
              </Section>

              {/* Order analytics */}
              <Section title="Order analytics">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <StatTile label="Total orders"  value={contact.total_orders.toString()} />
                  <StatTile label="Total spent"   value={`₹${contact.total_spent.toLocaleString("en-IN")}`} />
                  <StatTile label="Avg. order value" value={aov} />
                  <StatTile label="Customer since"
                    value={contact.first_order_at
                      ? new Date(contact.first_order_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "—"}
                  />
                </div>
                {contact.last_order_at && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                    <ShoppingBag size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    Last order: {new Date(contact.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </Section>

              {/* Custom attributes */}
              <Section title="Custom attributes">
                <ContactAttributeEditor
                  contactId={contactId!}
                  attributes={attrs}
                  onSet={(key, val) => setAttribute(contactId!, key, val)}
                  onDelete={(key) => deleteAttribute(contactId!, key)}
                  onRefetch={refetch}
                />
              </Section>
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        {!loading && contact && (
          <div style={{
            padding: "14px 24px", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)",
                color: "#DC2626", cursor: "pointer",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseOut={e  => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
            >
              <Trash2 size={12} /> Remove contact
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a
                href={`/dashboard/broadcast`}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--burgundy)", textDecoration: "none" }}
              >
                <Megaphone size={13} /> Broadcast
              </a>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 22px", borderRadius: 8, cursor: "pointer",
                  border: "none", background: "var(--text-dark)",
                  fontSize: 13, fontWeight: 700, color: "white",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
