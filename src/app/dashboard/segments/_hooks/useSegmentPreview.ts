"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildSegmentQuery } from "../_lib/segmentQueryBuilder";
import type { FilterCondition, SampleContact } from "@/types/segments";

interface UseSegmentPreviewReturn {
  count:           number;
  sampleContacts:  SampleContact[];
  estimatedCost:   number;
  loading:         boolean;
}

export function useSegmentPreview(
  filters:     FilterCondition[],
  conjunction: "AND" | "OR"
): UseSegmentPreviewReturn {
  const [count,          setCount]          = useState(0);
  const [sampleContacts, setSampleContacts] = useState<SampleContact[]>([]);
  const [loading,        setLoading]        = useState(false);

  useEffect(() => {
    if (filters.length === 0) {
      setCount(0);
      setSampleContacts([]);
      return;
    }

    /* 800ms debounce */
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const result = await buildSegmentQuery(
          supabase,
          user.id,
          filters,
          conjunction
        );

        const { data, count: total, error } = await (result as any);
        if (error) { console.error("[useSegmentPreview]", error); return; }

        setCount(total ?? 0);
        setSampleContacts(((data as SampleContact[]) ?? []).slice(0, 5));
      } catch (e) {
        console.error("[useSegmentPreview]", e);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [filters, conjunction]);

  return {
    count,
    sampleContacts,
    estimatedCost: Math.round(count * 0.89 * 100) / 100,
    loading,
  };
}
