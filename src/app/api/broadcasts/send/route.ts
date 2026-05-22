import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, message, segment, scheduleType, scheduledAt } = body;

  if (!name || !message || !segment) {
    return NextResponse.json(
      { error: "Missing required fields: name, message, segment" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Insert broadcast record
  const { data: broadcast, error } = await admin
    .from("broadcasts")
    .insert({
      user_id: user.id,
      name,
      message,
      segment,
      status: scheduleType === "later" ? "scheduled" : "sending",
      scheduled_at: scheduleType === "later" ? scheduledAt : null,
    })
    .select()
    .single();

  if (error) {
    console.error("[broadcasts/send] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Queue WhatsApp messages via your provider (e.g. Interakt, AiSensy, Gupshup)
  // For now, we simulate the send and mark as sent.
  if (scheduleType === "now") {
    await admin
      .from("broadcasts")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", broadcast.id);
  }

  return NextResponse.json({ ok: true, broadcast });
}
