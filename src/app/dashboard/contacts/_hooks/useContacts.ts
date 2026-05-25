"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContactWithTags } from "@/types/segments";

const PAGE_SIZE = 50;

interface UseContactsReturn {
  contacts:       ContactWithTags[];
  totalCount:     number;
  loading:        boolean;
  error:          string | null;
  searchQuery:    string;
  setSearchQuery: (q: string) => void;
  tagFilter:      string | null;   // tag id or null
  setTagFilter:   (id: string | null) => void;
  page:           number;
  setPage:        (n: number) => void;
  refetch:        () => void;
}

export function useContacts(): UseContactsReturn {
  const [contacts,    setContacts]    = useState<ContactWithTags[]>([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter,   setTagFilter]   = useState<string | null>(null);
  const [page,        setPage]        = useState(0);
  const [tick,        setTick]        = useState(0);

  const refetch = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const offset = page * PAGE_SIZE;

      // Use !inner join when filtering by tag so PostgREST returns only contacts
      // that have a matching contact_tags row (plain LEFT JOIN returns everyone).
      const joinClause = tagFilter
        ? "contact_tags!inner ( tag:tags ( id, name, color ) )"
        : "contact_tags ( tag:tags ( id, name, color ) )";

      let q = (supabase as any)
        .from("contacts")
        .select(`*, ${joinClause}`, { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (searchQuery) {
        q = q.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
      }
      if (tagFilter) {
        q = q.eq("contact_tags.tag_id", tagFilter);
      }

      const { data, error: dbErr, count } = await q;

      if (cancelled) return;
      if (dbErr) { setError(dbErr.message); setLoading(false); return; }

      setContacts((data as ContactWithTags[]) ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [searchQuery, tagFilter, page, tick]);

  /* Reset page when filters change */
  useEffect(() => { setPage(0); }, [searchQuery, tagFilter]);

  return {
    contacts, totalCount, loading, error,
    searchQuery, setSearchQuery,
    tagFilter, setTagFilter,
    page, setPage, refetch,
  };
}
