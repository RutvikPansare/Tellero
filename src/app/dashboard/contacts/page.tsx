"use client";

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { ContactsHeader }    from "./_components/ContactsHeader";
import { ContactsTable }     from "./_components/ContactsTable";
import { ContactDrawer }     from "./_components/ContactDrawer";
import { BulkActionBar }     from "./_components/BulkActionBar";
import { ManageTagsModal }   from "./_components/ManageTagsModal";
import { ImportCsvModal }    from "./_components/ImportCsvModal";
import { AddContactModal }   from "./_components/AddContactModal";
import { useContacts }       from "./_hooks/useContacts";
import { useContactTags }    from "./_hooks/useContactTags";
import { createClient }      from "@/lib/supabase/client";

/* ── CSV helpers ──────────────────────────────────────────────── */

/** Split one CSV line respecting quoted fields (including commas inside quotes). */
function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; } // escaped ""
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      cols.push(cur.trim()); cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

/** Parse CSV text → array of { header: value } objects. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  // Normalize headers: lowercase, spaces → underscores, strip surrounding quotes
  const headers = splitCsvLine(lines[0]).map(h =>
    h.toLowerCase().trim().replace(/\s+/g, "_")
  );
  return lines
    .slice(1)
    .filter(l => l.trim())
    .map(l => {
      const vals = splitCsvLine(l);
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
    });
}

/* ─────────────────────────────────────────────────────────────── */

export default function ContactsPage() {
  const [openId,        setOpenId]        = useState<string | null>(null);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [importMsg,     setImportMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [importing,     setImporting]     = useState(false);
  const [tagsModalOpen,   setTagsModalOpen]   = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addModalOpen,    setAddModalOpen]    = useState(false);

  const {
    contacts, totalCount, loading, error,
    searchQuery, setSearchQuery, refetch,
  } = useContacts();

  const { allTags, addTag, removeTag, createTag, renameTag, deleteTag, refetchTags } = useContactTags();

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

  /* ── CSV import ────────────────────────────────────────────── */
  async function handleImportFile(file: File) {
    setImporting(true);
    setImportMsg(null);

    try {
      const text  = await file.text();
      const rows  = parseCsv(text);
      // "phone" column is required; accept common aliases
      const valid = rows.filter(r => (r.phone || r.phone_number || r.mobile)?.trim());

      if (valid.length === 0) {
        setImportMsg({ text: 'No valid rows found. CSV must include a "phone" column.', ok: false });
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = valid.map(r => ({
        user_id:      user.id,
        phone:        (r.phone || r.phone_number || r.mobile).trim(),
        name:         r.name?.trim()        || null,
        email:        r.email?.trim()       || null,
        total_orders: parseInt(r.total_orders ?? "0")    || 0,
        total_spent:  parseFloat(r.total_spent ?? "0")   || 0,
      }));

      // upsert: insert new rows, update existing on (user_id, phone) conflict
      const { error: dbErr } = await (supabase as any)
        .from("contacts")
        .upsert(records, { onConflict: "user_id,phone", ignoreDuplicates: false });

      if (dbErr) throw new Error(dbErr.message);

      setImportMsg({ text: `${valid.length} contact${valid.length === 1 ? "" : "s"} imported successfully.`, ok: true });
      refetch();
    } catch (err) {
      setImportMsg({ text: (err as Error).message, ok: false });
    } finally {
      setImporting(false);
    }
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
        importing={importing}
        onAdd={() => setAddModalOpen(true)}
        onManageTags={() => setTagsModalOpen(true)}
        onImport={() => setImportModalOpen(true)}
      />

      {/* Import status banner */}
      {importMsg && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderRadius: 10,
          background: importMsg.ok ? "rgba(21,128,61,0.06)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${importMsg.ok ? "rgba(21,128,61,0.2)" : "rgba(239,68,68,0.18)"}`,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: importMsg.ok ? "#15803D" : "#DC2626" }}>
            {importMsg.text}
          </p>
          <button
            type="button"
            onClick={() => setImportMsg(null)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)", display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

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

      {tagsModalOpen && (
        <ManageTagsModal
          tags={allTags}
          onClose={() => setTagsModalOpen(false)}
          onCreate={async (name, color) => { const t = await createTag(name, color); refetchTags(); return t; }}
          onRename={renameTag}
          onDelete={deleteTag}
        />
      )}

      {importModalOpen && (
        <ImportCsvModal
          onClose={() => setImportModalOpen(false)}
          onFile={handleImportFile}
        />
      )}

      {addModalOpen && (
        <AddContactModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { refetch(); }}
        />
      )}
    </div>
  );
}
