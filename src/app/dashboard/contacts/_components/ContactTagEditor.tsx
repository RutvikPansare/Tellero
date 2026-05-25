"use client";

import { useState } from "react";
import { TagInput } from "@/components/shared/TagInput";
import { TagBadge } from "@/components/shared/TagBadge";
import type { Tag } from "@/types/segments";

interface Props {
  contactId:     string;
  contactTags:   Tag[];
  allTags:       Tag[];
  onAdd:         (tagId: string) => Promise<void>;
  onRemove:      (tagId: string) => Promise<void>;
  onCreateNew:   (name: string, color: string) => Promise<Tag>;
}

export function ContactTagEditor({
  contactId, contactTags, allTags, onAdd, onRemove, onCreateNew,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(tag: Tag) {
    setError(null);
    try { await onAdd(tag.id); }
    catch (e) { setError((e as Error).message); }
  }

  async function handleRemove(tagId: string) {
    setError(null);
    try { await onRemove(tagId); }
    catch (e) { setError((e as Error).message); }
  }

  async function handleCreate(name: string, color: string): Promise<Tag> {
    setError(null);
    const tag = await onCreateNew(name, color);
    await onAdd(tag.id);
    return tag;
  }

  void contactId; // used by parent to scope operations

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <TagInput
        selectedTags={contactTags}
        availableTags={allTags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onCreateNew={handleCreate}
        placeholder="Search or create tag…"
      />
      {error && (
        <p style={{ fontSize: 11, color: "#DC2626", margin: 0 }}>{error}</p>
      )}
    </div>
  );
}
