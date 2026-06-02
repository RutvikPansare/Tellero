import { NextResponse }  from "next/server";
import { createClient }   from "@/lib/supabase/server";
import { submitTemplate }  from "@/app/dashboard/templates/_lib/metaTemplateApi";
import type { MetaComponent } from "@/app/dashboard/templates/_lib/metaTemplateApi";
import type { ButtonItem }    from "@/app/dashboard/templates/_lib/templateHelpers";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const db = supabase as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* Get the brand's WABA credentials from profiles */
    const { data: profile } = await db
      .from("profiles")
      .select("waba_id, meta_access_token")
      .eq("id", user.id)
      .single() as { data: { waba_id: string | null; meta_access_token: string | null } | null };

    const {
      name, category, language,
      header, body, variableLabels, footer, buttons,
    }: {
      name:           string;
      category:       "MARKETING" | "UTILITY" | "AUTHENTICATION";
      language:       string;
      header:         { enabled: boolean; type: string; text: string; sampleUrl: string };
      body:           string;
      variableLabels: Record<string, string>;
      footer:         { enabled: boolean; text: string };
      buttons:        { enabled: boolean; items: ButtonItem[] };
    } = await req.json();

    /* Build Meta components array */
    const components: MetaComponent[] = [];

    if (header?.enabled) {
      const comp: MetaComponent = {
        type:   "HEADER",
        format: header.type as MetaComponent["format"],
      };
      if (header.type === "TEXT" && header.text) {
        comp.text = header.text;
      } else if (header.type !== "TEXT" && header.sampleUrl) {
        comp.example = { header_url: [header.sampleUrl.trim()] };
      }
      components.push(comp);
    }

    components.push({ type: "BODY", text: body });

    if (footer?.enabled && footer.text) {
      components.push({ type: "FOOTER", text: footer.text });
    }

    if (buttons?.enabled && buttons.items.length > 0) {
      components.push({
        type:    "BUTTONS",
        buttons: buttons.items.map(btn => ({
          type:          btn.subtype as "PHONE_NUMBER" | "URL" | "QUICK_REPLY",
          text:          btn.text,
          url:           btn.subtype === "URL"          ? btn.value : undefined,
          phone_number:  btn.subtype === "PHONE_NUMBER" ? btn.value : undefined,
        })),
      });
    }

    /* If no Meta credentials yet — save as draft */
    if (!profile?.waba_id || !profile?.meta_access_token) {
      const { data: tmpl, error: insertError } = await db
        .from("templates")
        .insert({
          user_id:         user.id,
          name,
          category,
          language,
          components,
          variable_labels: variableLabels,
          status:          "draft",
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      return NextResponse.json({ template: tmpl, note: "Saved as draft — no Meta credentials configured" });
    }

    /* Submit to Meta */
    const { id: metaId, status } = await submitTemplate(
      profile.waba_id,
      profile.meta_access_token,
      { name, category, language, components }
    );

    /* Save to Supabase */
    const { data: tmpl, error: insertError } = await db
      .from("templates")
      .insert({
        user_id:          user.id,
        name,
        category,
        language,
        components,
        variable_labels:  variableLabels,
        meta_template_id: metaId,
        status:           status === "APPROVED" ? "approved" : "pending",
        submitted_at:     new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return NextResponse.json({ template: tmpl });

  } catch (err) {
    console.error("[POST /api/templates/create]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
