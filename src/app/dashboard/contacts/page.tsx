"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { ContactsHeader }  from "./_components/ContactsHeader";
import { ContactsTable }   from "./_components/ContactsTable";
import { ContactDrawer }   from "./_components/ContactDrawer";
import { BulkActionBar }   from "./_components/BulkActionBar";
import { useContacts }     from "./_hooks/useContacts";
import { useContactTags }  from "./_hooks/useContactTags";
import { createClient }    from "@/lib/supabase/client";

export default function ContactsPage() {
  const [openId,      setOpenId]      = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    contacts, totalCount, loading, error,
    searchQuery, setSearchQuery, refetch,
  } = useContacts();

  const { allTags, addTag, removeTag } = useContactTags();

  /* ── Selection helpers ──────────────────────────────────── */
  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  function selectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(contacts.map(c => c.id)) : new Set());
  }

  /* ── Bulk actions ───────────────────────────────────────── */
  async function bulkAddTag(tagId: string) {
    await Promise.all(Array.from(selectedIds).map(id => addTag(id, tagId)));
    refetch();
  }

  async function bulkRemoveTag(tagId: string) {
    await Promise.all(Array.from(selectedIds).map(id => removeTag(id, tagId)));
    refetch();
  }

  async function bulkDelete() {
    const supabase = createClient();
    await (supabase as any)
      .from("contacts")
      .delete()
      .in("id", Array.from(selectedIds));
    setSelectedIds(new Set());
    refetch();
  }

  function exportCsv() {
    const selected = contacts.filter(c => selectedIds.has(c.id));
    const rows = [
      ["Name", "Phone", "Email", "Total Orders", "Total Spent", "Tags"],
      ...selected.map(c => [
        c.name ?? "",
        c.phone,
        c.email ?? "",
        c.total_orders.toString(),
        c.total_spent.toString(),
        c.contact_tags.map(ct => ct.tag.name).join("; "),
      ]),
    ];
    const csv  = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "contacts.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, background: "var(--cream)" }}>

      <ContactsHeader
        contacts={contacts}
        totalCount={totalCount}
        onManageTags={() => {/* TODO: open tags management modal */}}
        onImport={() => {/* TODO: CSV import flow */}}
      />

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 360 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          style={{
            width: "100%", padding: "9px 14px 9px 34px",
            borderRadius: "var(--radius-btn)", border: "1.5px solid var(--border)",
            background: "white", fontSize: 13, color: "var(--text-dark)", outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="Search by name or phone…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={e  => (e.currentTarget.style.borderColor = "var(--text-dark)")}
          onBlur={e   => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, padding: "10px 16px" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>Error: {error}</p>
        </div>
      )}

      <ContactsTable
        contacts={contacts}
        loading={loading}
        selectedIds={selectedIds}
        onSelect={toggleSelect}
        onSelectAll={selectAll}
        onClick={id => { setOpenId(id); setSelectedIds(new Set()); }}
      />

      {/* Pagination hint */}
      {totalCount > contacts.length && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          Showing {contacts.length} of {totalCount.toLocaleString("en-IN")} contacts
        </p>
      )}

      <ContactDrawer
        contactId={openId}
        onClose={() => setOpenId(null)}
        onDeleted={() => { refetch(); }}
      />

      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        allTags={allTags}
        onAddTag={bulkAddTag}
        onRemoveTag={bulkRemoveTag}
        onExport={exportCsv}
        onDelete={bulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
