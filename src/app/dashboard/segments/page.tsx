"use client";

import { useState } from "react";
import { SegmentsHeader }      from "./_components/SegmentsHeader";
import { SegmentList }         from "./_components/SegmentList";
import { CreateSegmentModal }  from "./_components/CreateSegmentModal";
import { useSegments }         from "./_hooks/useSegments";
import type { Segment } from "@/types/segments";

export default function SegmentsPage() {
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  const { segments, loading, error, refetch, deleteSegment } = useSegments();

  function openNew() {
    setEditingSegment(null);
    setModalOpen(true);
  }

  function openEdit(seg: Segment) {
    setEditingSegment(seg);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this segment?")) return;
    try { await deleteSegment(id); }
    catch (e) { alert((e as Error).message); }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, background: "var(--cream)" }}>

      <SegmentsHeader segments={segments} onNew={openNew} />

      {error && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, padding: "10px 16px" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>Error: {error}</p>
        </div>
      )}

      <SegmentList
        segments={segments}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onNew={openNew}
      />

      <CreateSegmentModal
        open={modalOpen}
        editingSegment={editingSegment}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
