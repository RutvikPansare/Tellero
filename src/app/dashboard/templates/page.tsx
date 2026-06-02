"use client";

import { useState } from "react";
import { TemplatesHeader }       from "./_components/TemplatesHeader";
import { TemplateList }          from "./_components/TemplateList";
import { CreateTemplateModal }   from "./_components/CreateTemplateModal";
import { TemplateDetailModal }   from "./_components/TemplateDetailModal";
import { NewConversationModal }  from "../inbox/_components/NewConversationModal";
import { useTemplates }          from "./_hooks/useTemplates";
import { useTemplateSync }       from "./_hooks/useTemplateSync";
import type { Template }         from "./_lib/templateHelpers";

export default function TemplatesPage() {
  const [createOpen,      setCreateOpen]      = useState(false);
  const [viewTemplate,    setViewTemplate]    = useState<Template | null>(null);
  const [chatTemplateId,  setChatTemplateId]  = useState<string | null>(null);

  const {
    templates, allTemplates, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    refetch, updateTemplate,
  } = useTemplates();

  const { syncing, lastSynced, sync } = useTemplateSync(refetch);

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    refetch();
  }

  function handleUpdated(updated: Template) {
    updateTemplate(updated);
    setViewTemplate(updated);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      <TemplatesHeader
        templates={allTemplates}
        syncing={syncing}
        lastSynced={lastSynced}
        onSync={sync}
        onNew={() => setCreateOpen(true)}
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
        onView={setViewTemplate}
        onNew={() => setCreateOpen(true)}
      />

      <CreateTemplateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refetch}
      />

      <TemplateDetailModal
        template={viewTemplate}
        onClose={() => setViewTemplate(null)}
        onUpdated={handleUpdated}
        onStartChat={id => { setViewTemplate(null); setChatTemplateId(id); }}
      />

      {chatTemplateId && (
        <NewConversationModal
          initialTemplateId={chatTemplateId}
          onClose={() => setChatTemplateId(null)}
          onConversationCreated={conversationId => {
            setChatTemplateId(null);
            window.location.href = `/dashboard/inbox?conversation=${conversationId}`;
          }}
        />
      )}
    </div>
  );
}
