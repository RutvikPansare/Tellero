"use client";

import { useState } from "react";
import { TemplatesHeader }       from "./_components/TemplatesHeader";
import { TemplateList }          from "./_components/TemplateList";
import { CreateTemplateModal }   from "./_components/CreateTemplateModal";
import { useTemplates }          from "./_hooks/useTemplates";
import { useTemplateSync }       from "./_hooks/useTemplateSync";

export default function TemplatesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    templates, allTemplates, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    refetch,
  } = useTemplates();

  const { syncing, lastSynced, sync } = useTemplateSync(refetch);

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      <TemplatesHeader
        templates={allTemplates}
        syncing={syncing}
        lastSynced={lastSynced}
        onSync={sync}
        onNew={() => setModalOpen(true)}
      />

      <TemplateList
        templates={templates}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onDelete={handleDelete}
        onRefresh={_id => { sync(); }}
        onNew={() => setModalOpen(true)}
      />

      <CreateTemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
