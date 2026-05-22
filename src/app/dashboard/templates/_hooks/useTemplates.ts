"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Template, TemplateStatus } from "../_lib/templateHelpers";

interface UseTemplatesReturn {
  templates:       Template[];
  allTemplates:    Template[];
  loading:         boolean;
  error:           string | null;
  searchQuery:     string;
  setSearchQuery:  (q: string) => void;
  statusFilter:    TemplateStatus | "all";
  setStatusFilter: (s: TemplateStatus | "all") => void;
  refetch:         () => void;
}

/** Derive body/header/footer/buttons from raw components array */
function deriveFields(raw: Template): Template {
  const comps = (raw.components ?? []) as Array<Record<string, unknown>>;
  let body    = "";
  let header: Template["header"]  = undefined;
  let footer: Template["footer"]  = undefined;
  let buttons: Template["buttons"] = undefined;

  for (const c of comps) {
    const type = (c.type as string)?.toUpperCase();
    if (type === "BODY")    body    = c.text as string;
    if (type === "FOOTER")  footer  = c.text as string;
    if (type === "HEADER")  header  = { type: c.format as import("../_lib/templateHelpers").HeaderType, text: c.text as string | undefined };
    if (type === "BUTTONS") buttons = (c.buttons as Template["buttons"]) ?? [];
  }

  return { ...raw, body, header, footer, buttons };
}

export function useTemplates(): UseTemplatesReturn {
  const [allTemplates, setAll]           = useState<Template[]>([]);
  const [loading, setLoading]            = useState(true);
  const [error, setError]                = useState<string | null>(null);
  const [searchQuery, setSearchQuery]    = useState("");
  const [statusFilter, setStatusFilter]  = useState<TemplateStatus | "all">("all");
  const [tick, setTick]                  = useState(0);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const db = supabase as any;
      const { data, error: dbErr } = await db
        .from("templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (dbErr) { setError(dbErr.message); setLoading(false); return; }

      const derived = ((data as Template[]) ?? []).map(deriveFields);
      setAll(derived);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  /* Client-side filtering */
  const templates = allTemplates.filter((t) => {
    const matchSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return { templates, allTemplates, loading, error, searchQuery, setSearchQuery, statusFilter, setStatusFilter, refetch };
}
