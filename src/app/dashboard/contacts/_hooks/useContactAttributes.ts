"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useContactAttributes() {
  const setAttribute = useCallback(async (
    contactId: string,
    key:       string,
    value:     string
  ): Promise<void> => {
    const supabase = createClient();
    const { error } = await (supabase as any).rpc("set_contact_attribute", {
      p_contact_id: contactId,
      p_key:        key,
      p_value:      value,
    });
    if (error) throw new Error(error.message);
  }, []);

  const deleteAttribute = useCallback(async (
    contactId: string,
    key:       string
  ): Promise<void> => {
    const supabase = createClient();
    const { error } = await (supabase as any).rpc("delete_contact_attribute", {
      p_contact_id: contactId,
      p_key:        key,
    });
    if (error) throw new Error(error.message);
  }, []);

  return { setAttribute, deleteAttribute };
}
