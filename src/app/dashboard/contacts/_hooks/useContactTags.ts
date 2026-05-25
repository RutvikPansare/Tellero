"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tag } from "@/types/segments";

interface UseContactTagsReturn {
  allTags:    Tag[];
  loading:    boolean;
  error:      string | null;
  addTag:     (contactId: string, tagId: string) => Promise<void>;
  removeTag:  (contactId: string, tagId: string) => Promise<void>;
  createTag:  (name: string, color: string) => Promise<Tag>;
  refetchTags:() => void;
}

export function useContactTags(): UseContactTagsReturn {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const refetchTags = useCallback(() => setTick(n => n + 1), []);

  /* Load all tags for this user */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data, error: dbErr } = await (supabase as any)
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (cancelled) return;
      if (dbErr) { setError(dbErr.message); setLoading(false); return; }
      setAllTags((data as Tag[]) ?? []);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  async function addTag(contactId: string, tagId: string): Promise<void> {
    const supabase = createClient();
    const { error: dbErr } = await (supabase as any)
      .from("contact_tags")
      .insert({ contact_id: contactId, tag_id: tagId });
    if (dbErr) throw new Error(dbErr.message);
  }

  async function removeTag(contactId: string, tagId: string): Promise<void> {
    const supabase = createClient();
    const { error: dbErr } = await (supabase as any)
      .from("contact_tags")
      .delete()
      .eq("contact_id", contactId)
      .eq("tag_id", tagId);
    if (dbErr) throw new Error(dbErr.message);
  }

  async function createTag(name: string, color: string): Promise<Tag> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error: dbErr } = await (supabase as any)
      .from("tags")
      .insert({ user_id: user.id, name, color })
      .select()
      .single();

    if (dbErr) throw new Error(dbErr.message);
    refetchTags();
    return data as Tag;
  }

  return { allTags, loading, error, addTag, removeTag, createTag, refetchTags };
}
