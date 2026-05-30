"use client";

import { useEffect } from "react";
import { X, MessageCircle, Phone, ExternalLink, Trash2 } from "lucide-react";
import { useContact }             from "../_hooks/useContact";
import { useContactTags }          from "../_hooks/useContactTags";
import { useContactAttributes }    from "../_hooks/useContactAttributes";
import { ContactTagEditor }        from "./ContactTagEditor";
import { ContactAttributeEditor }  from "./ContactAttributeEditor";
import type { Tag } from "@/types/segments";

interface Props {
  contactId: string | null;
  onClose:   () => void;
  onDeleted: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
      <p style={labelStyle}>{title}</p>
      {children}
    </div>
  );
}

export function ContactDrawer({ contactId, onClose, onDeleted }: Props) {
  const { contact, loading, refetch } = useContact(contactId);
  const { allTags, addTag, removeTag, createTag } = useContactTags();
  const { setAttribute, deleteAttribute } = useContactAttributes();

  /* Lock scroll behind drawer */
  useEffect(() => {
    if (contactId) document.body.style.overflow = "hidden";
    else           document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [contactId]);

  if (!contactId) return null;

  const contactTags: Tag[] = contact?.contact_tags.map(ct => ct.tag) ?? [];
  const attrs: Record<string, string> =
    (contact?.attributes as Record<string, string>) ?? {};

  async function handleAddTag(tagId: string) {
    await addTag(contactId!, tagId);
    refetch();
  }
  async function handleRemoveTag(tagId: string) {
    await removeTag(contactId!, tagId);
    refetch();
  }
  async function handleCreateTag(name: string, color: string): Promise<Tag> {
    const tag = await createTag(name, color);
    return tag;
  }

  async function handleDelete() {
    if (!confirm("Remove this contact? This cannot be undone.")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await (supabase as any).from("contacts").delete().eq("id", contactId);
    onDeleted();
    onClose();
  }

  const waLink = contact
    ? `https://wa.me/${contact.phone.replace(/\D/g, "")}`
    : "#";

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 150,
          background: "rgba(26,20,17,0.3)", backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position:   "fixed",
        top:        0,
        right:      0,
        bottom:     0,
        width:      380,
        zIndex:     160,
        background: "white",
        borderLeft: "1px solid var(--border)",
        boxShadow:  "-8px 0 32px rgba(0,0,0,0.08)",
        display:    "flex",
        flexDirection: "column",
        overflowY:  "auto",
      }}>

        {/* Header */}
        <div style={{
          padding:      "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
          display:      "flex",
          alignItems:   "flex-start",
          justifyContent:"space-between",
          flexShrink:   0,
          background:   "white",
        }}>
          {loading ? (
            <div style={{ height: 20, width: 120, borderRadius: 4, background: "var(--border)" }} />
          ) : (
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
                {contact?.name ?? "Unknown"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{contact?.phone}</span>
                <a href={waLink} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#25D366", fontWeight: 600, textDecoration: "none" }}>
                  <MessageCircle size={11} /> Chat
                </a>
              </div>
            </div>
          )}
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "var(--text-muted)" }}
            onMouseOver={e=>(e.currentTarget.style.background="var(--cream-2)")}
            onMouseOut={e =>(e.currentTarget.style.background="transparent")}>
            <X size={16} />
          </button>
        </div>

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

            {/* Attributes */}
            <Section title="Custom attributes">
              <ContactAttributeEditor
                contactId={contactId!}
                attributes={attrs}
                onSet={(key, val) => setAttribute(contactId!, key, val)}
                onDelete={(key) => deleteAttribute(contactId!, key)}
                onRefetch={refetch}
              />
            </Section>

            {/* Analytics */}
            <Section title="Order analytics">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Total orders",  value: contact.total_orders.toString() },
                  { label: "Total spent",   value: `₹${contact.total_spent.toLocaleString("en-IN")}` },
                  { label: "AOV",           value: contact.total_orders > 0 ? `₹${Math.round(contact.total_spent / contact.total_orders).toLocaleString("en-IN")}` : "—" },
                  { label: "Customer since",value: contact.first_order_at ? new Date(contact.first_order_at).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "—" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{s.label}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {contact.last_order_at && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                  Last order: {new Date(contact.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </Section>

            {/* Danger zone */}
            <Section title="Danger zone">
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)",
                  color: "#DC2626", cursor: "pointer",
                }}
                onMouseOver={e=>(e.currentTarget.style.background="rgba(239,68,68,0.1)")}
                onMouseOut={e =>(e.currentTarget.style.background="rgba(239,68,68,0.05)")}
              >
                <Trash2 size={12} /> Remove contact
              </button>
            </Section>
          </>
        )}
      </div>
    </>
  );
}
