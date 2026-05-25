"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Segment } from "@/types/segments";

interface UseSegmentsReturn {
  segments:      Segment[];
  loading:       boolean;
  error:         string | null;
  refetch:       () => void;
  deleteSegment: (id: string) => Promise<void>;
}

export function useSegments(): UseSegmentsReturn {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const refetch = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data, error: dbErr } = await (supabase as any)
        .from("segments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (dbErr) { setError(dbErr.message); setLoading(false); return; }
      setSegments((data as Segment[]) ?? []);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  async function deleteSegment(id: string): Promise<void> {
    const supabase = createClient();
    const { error: dbErr } = await (supabase as any)
      .from("segments")
      .delete()
      .eq("id", id);
    if (dbErr) throw new Error(dbErr.message);
    refetch();
  }

  return { segments, loading, error, refetch, deleteSegment };
}
