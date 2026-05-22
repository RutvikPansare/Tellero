"use client";

import { useState, useCallback } from "react";

interface UseSyncReturn {
  syncing:    boolean;
  lastSynced: Date | null;
  sync:       () => Promise<void>;
}

export function useTemplateSync(onSynced: () => void): UseSyncReturn {
  const [syncing,    setSyncing]    = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Triggers the server-side Edge Function that checks all pending templates
  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/templates/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      setLastSynced(new Date());
      onSynced();
    } catch (err) {
      console.error("[useTemplateSync]", err);
    } finally {
      setSyncing(false);
    }
  }, [onSynced]);

  return { syncing, lastSynced, sync };
}
