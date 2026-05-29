import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactRow {
  id: string;
  phone: string;
  name: string | null;
}

// ─── WhatsApp send helpers ────────────────────────────────────────────────────

async function getPhoneNumberId(wabaId: string, accessToken: string): Promise<string | null> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0]?.id ?? null;
}

async function sendWhatsAppText(params: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
}): Promise<string | null> {
  const { phoneNumberId, accessToken, to, text } = params;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    console.error("[broadcasts/send] Meta API error:", err);
    return null;
  }
  const data = await res.json();
  return data.messages?.[0]?.id ?? null;
}

function personalizeMessage(template: string, name: string | null): string {
  return template
    .replace(/\{\{name\}\}/gi, name ?? "there")
    .replace(/\{\{link\}\}/gi, "");
}

// ─── Segment → contacts ───────────────────────────────────────────────────────

async function resolveSegment(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  segment: string
): Promise<ContactRow[]> {
  let query = (admin as any)
    .from("contacts")
    .select("id, phone, name")
    .eq("user_id", userId)
    .eq("marketing_opted_out", false)
    .not("phone", "is", null);

  // Segment-specific filters
  if (segment === "at_risk") {
    // Customers who haven't ordered in 30–90 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
    query = query
      .gte("last_order_at", ninetyDaysAgo)
      .lte("last_order_at", thirtyDaysAgo);
  } else if (segment === "vip") {
    query = query.gte("total_spent", 5000);
  }
  // 'all' and other segments: no additional filter

  const { data, error } = await query.limit(10000);
  if (error) {
    console.error("[broadcasts/send] segment query error:", error);
    return [];
  }
  return (data as ContactRow[]) ?? [];
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, message, segment, scheduleType, scheduledAt } = body;

  if (!name || !message || !segment) {
    return NextResponse.json(
      { error: "Missing required fields: name, message, segment" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Resolve contacts first so we know total_recipients
  const contacts = scheduleType === "now"
    ? await resolveSegment(admin, user.id, segment)
    : [];

  // Insert broadcast record
  const { data: broadcast, error: broadcastError } = await (admin as any)
    .from("broadcasts")
    .insert({
      user_id:          user.id,
      name,
      message,
      segment,
      status:           scheduleType === "later" ? "scheduled" : "sending",
      scheduled_at:     scheduleType === "later" ? scheduledAt : null,
      total_recipients: contacts.length,
    })
    .select()
    .single();

  if (broadcastError) {
    console.error("[broadcasts/send] DB error:", broadcastError);
    return NextResponse.json({ error: broadcastError.message }, { status: 500 });
  }

  if (scheduleType === "later") {
    return NextResponse.json({ ok: true, broadcast });
  }

  // ── Send now ────────────────────────────────────────────────────────────────

  // Fetch Meta credentials
  const { data: profile } = await (admin as any)
    .from("profiles")
    .select("waba_id, meta_access_token")
    .eq("id", user.id)
    .single();

  if (!profile?.waba_id || !profile?.meta_access_token) {
    // No Meta connection — mark as failed
    await (admin as any)
      .from("broadcasts")
      .update({ status: "failed" })
      .eq("id", broadcast.id);
    return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });
  }

  const phoneNumberId = await getPhoneNumberId(profile.waba_id, profile.meta_access_token);
  if (!phoneNumberId) {
    await (admin as any)
      .from("broadcasts")
      .update({ status: "failed" })
      .eq("id", broadcast.id);
    return NextResponse.json({ error: "Failed to fetch WhatsApp phone number" }, { status: 500 });
  }

  // Return immediately — send in background
  const sendPromise = (async () => {
    let sentCount = 0;

    for (const contact of contacts) {
      try {
        const personalizedText = personalizeMessage(message, contact.name);
        const metaMessageId = await sendWhatsAppText({
          phoneNumberId,
          accessToken: profile.meta_access_token,
          to:          contact.phone,
          text:        personalizedText,
        });

        // Insert broadcast_recipient row with meta_message_id for status tracking
        await (admin as any)
          .from("broadcast_recipients")
          .upsert({
            broadcast_id:    broadcast.id,
            contact_id:      contact.id,
            phone:           contact.phone,
            status:          metaMessageId ? "sent" : "failed",
            meta_message_id: metaMessageId,
            sent_at:         metaMessageId ? new Date().toISOString() : null,
            failed_at:       metaMessageId ? null : new Date().toISOString(),
          }, { onConflict: "broadcast_id,contact_id", ignoreDuplicates: false });

        if (metaMessageId) sentCount++;
      } catch (err) {
        console.error(`[broadcasts/send] error sending to ${contact.phone}:`, err);
      }
    }

    // Mark broadcast as sent
    await (admin as any)
      .from("broadcasts")
      .update({
        status:          "sent",
        sent_at:         new Date().toISOString(),
        total_recipients: sentCount,
      })
      .eq("id", broadcast.id);
  })();

  // Don't await — let it run in background on Vercel
  sendPromise.catch(err => console.error("[broadcasts/send] background send error:", err));

  return NextResponse.json({ ok: true, broadcast });
}
