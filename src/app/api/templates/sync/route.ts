import { NextResponse }     from "next/server";
import { createClient }      from "@/lib/supabase/server";
import { getTemplateStatus } from "@/app/dashboard/templates/_lib/metaTemplateApi";

export async function POST() {
  try {
    const supabase = await createClient();
    const db = supabase as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await db
      .from("profiles")
      .select("waba_id, meta_access_token")
      .eq("id", user.id)
      .single() as { data: { waba_id: string | null; meta_access_token: string | null } | null };

    if (!profile?.waba_id || !profile?.meta_access_token) {
      return NextResponse.json({ synced: 0, note: "No Meta credentials" });
    }

    /* Fetch all pending templates that have a meta_template_id */
    const { data: pending } = await db
      .from("templates")
      .select("id, meta_template_id, status, category")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .not("meta_template_id", "is", null) as {
        data: Array<{ id: string; meta_template_id: string; status: string; category: string }> | null
      };

    if (!pending?.length) return NextResponse.json({ synced: 0 });

    let synced = 0;
    await Promise.all(
      pending.map(async (t) => {
        try {
          const { status, reason, category } = await getTemplateStatus(
            profile.waba_id!,
            profile.meta_access_token!,
            t.meta_template_id
          );

          const mapped =
            status === "APPROVED" ? "approved" :
            status === "REJECTED" ? "rejected" :
            status === "PAUSED"   ? "paused"   : "pending";

          const metaCategory = category ?? null;
          const catChanged   = metaCategory && t.category && metaCategory !== t.category;

          if (mapped !== t.status || catChanged) {
            const updatePayload: Record<string, unknown> = {
              status:           mapped,
              rejection_reason: reason ?? null,
              approved_at:      mapped === "approved" ? new Date().toISOString() : null,
            };
            if (metaCategory) updatePayload.category = metaCategory;

            await db.from("templates").update(updatePayload).eq("id", t.id);
            synced++;
          }
        } catch {
          /* Skip individual failures */
        }
      })
    );

    return NextResponse.json({ synced });
  } catch (err) {
    console.error("[POST /api/templates/sync]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
