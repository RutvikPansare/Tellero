"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContactWithTags } from "@/types/segments";

export function useContact(contactId: string | null) {
  const [contact,  setContact]  = useState<ContactWithTags | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const refetch = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    if (!contactId) { setContact(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const supabase = createClient();
      const { data, error: dbErr } = await (supabase as any)
        .from("contacts")
        .select(`*, contact_tags ( tag:tags ( id, name, color ) )`)
        .eq("id", contactId)
        .single();

      if (cancelled) return;
      if (dbErr) { setError(dbErr.message); setLoading(false); return; }
      setContact(data as ContactWithTags);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [contactId, tick]);

  return { contact, loading, error, refetch };
}
