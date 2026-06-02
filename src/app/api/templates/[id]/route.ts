import { NextResponse }  from "next/server";
import { createClient }   from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteTemplate, getTemplateStatus } from "@/app/dashboard/templates/_lib/metaTemplateApi";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from("templates")
    .select("id, name, language, body, components, variable_labels, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const db = supabase as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* Fetch the template to check ownership & get Meta ID */
    const { data: tmpl, error: fetchErr } = await db
      .from("templates")
      .select("id, user_id, name, meta_template_id, status")
      .eq("id", params.id)
      .single() as {
        data: { id: string; user_id: string; name: string; meta_template_id: string | null; status: string } | null;
        error: unknown;
      };

    if (fetchErr || !tmpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tmpl.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    /* Only draft/rejected can be deleted */
    if (!["draft", "rejected"].includes(tmpl.status)) {
      return NextResponse.json({ error: "Only draft or rejected templates can be deleted" }, { status: 400 });
    }

    /* Delete from Meta if it was submitted */
    if (tmpl.meta_template_id) {
      const { data: profile } = await db
        .from("profiles")
        .select("waba_id, meta_access_token")
        .eq("id", user.id)
        .single() as { data: { waba_id: string | null; meta_access_token: string | null } | null };

      if (profile?.waba_id && profile?.meta_access_token) {
        try {
          await deleteTemplate(profile.waba_id, profile.meta_access_token, tmpl.name);
        } catch {
          /* Non-fatal — delete from DB anyway */
        }
      }
    }

    await db.from("templates").delete().eq("id", params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/templates/[id]]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** PATCH /api/templates/[id] — refresh status for a single template from Meta */
export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const db = supabase as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: tmpl } = await db
      .from("templates")
      .select("id, user_id, meta_template_id, status")
      .eq("id", params.id)
      .single() as { data: { id: string; user_id: string; meta_template_id: string | null; status: string } | null };

    if (!tmpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tmpl.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!tmpl.meta_template_id) return NextResponse.json({ error: "No Meta template ID" }, { status: 400 });

    const { data: profile } = await db
      .from("profiles")
      .select("waba_id, meta_access_token")
      .eq("id", user.id)
      .single() as { data: { waba_id: string | null; meta_access_token: string | null } | null };

    if (!profile?.waba_id || !profile?.meta_access_token) {
      return NextResponse.json({ error: "No Meta credentials" }, { status: 422 });
    }

    const { status, reason, category } = await getTemplateStatus(
      profile.waba_id,
      profile.meta_access_token,
      tmpl.meta_template_id
    );

    const mapped =
      status === "APPROVED" ? "approved" :
      status === "REJECTED" ? "rejected" :
      status === "PAUSED"   ? "paused"   : "pending";

    // Detect category change (Meta sometimes overrides UTILITY → MARKETING)
    const { data: current } = await db
      .from("templates")
      .select("category")
      .eq("id", params.id)
      .single() as { data: { category: string } | null };

    const metaCategory    = category ?? null;
    const categoryChanged = metaCategory && current?.category && metaCategory !== current.category;

    const updatePayload: Record<string, unknown> = {
      status:           mapped,
      rejection_reason: reason ?? null,
      approved_at:      mapped === "approved" ? new Date().toISOString() : null,
    };
    if (metaCategory) updatePayload.category = metaCategory;

    const { data: updated } = await db
      .from("templates")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single();

    return NextResponse.json({
      template: updated,
      categoryChanged: !!categoryChanged,
      previousCategory: categoryChanged ? current?.category : null,
    });
  } catch (err) {
    console.error("[PATCH /api/templates/[id]]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
