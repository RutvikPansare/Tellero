/**
 * 6 starter WhatsApp message templates.
 * Run this once after auth to pre-populate the templates table
 * so users see examples immediately.
 *
 * Usage (in a server action or API route):
 *   import { seedTemplates } from "@/lib/seedTemplates";
 *   await seedTemplates(supabase, userId);
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const SEEDS = [
  {
    name: "order_confirmation",
    category: "UTILITY",
    language: "en",
    components: [
      { type: "HEADER", format: "TEXT", text: "Order Confirmed 🎉" },
      { type: "BODY",   text: "Hi {{1}}, your order #{{2}} has been confirmed! Total amount: ₹{{3}}. We'll notify you when it ships." },
      { type: "FOOTER", text: "Reply STOP to unsubscribe" },
      { type: "BUTTONS", buttons: [{ type: "URL", text: "Track order", url: "https://track.example.com/{{2}}" }] },
    ],
    variable_labels: { "1": "customer name", "2": "order ID", "3": "amount" },
    status: "draft",
  },
  {
    name: "shipping_update",
    category: "UTILITY",
    language: "en",
    components: [
      { type: "HEADER", format: "TEXT", text: "Your order is on the way 🚚" },
      { type: "BODY",   text: "Hi {{1}}, great news! Your order #{{2}} has been shipped and will arrive by {{3}}. Track using: {{4}}" },
      { type: "BUTTONS", buttons: [{ type: "URL", text: "Track shipment", url: "https://track.example.com/{{4}}" }] },
    ],
    variable_labels: { "1": "customer name", "2": "order ID", "3": "delivery date", "4": "tracking link" },
    status: "draft",
  },
  {
    name: "otp_verification",
    category: "AUTHENTICATION",
    language: "en",
    components: [
      { type: "BODY",   text: "Your verification code is *{{1}}*. This code expires in {{2}} minutes. Do not share it with anyone." },
      { type: "FOOTER", text: "If you didn't request this, ignore this message" },
    ],
    variable_labels: { "1": "OTP code", "2": "expiry minutes" },
    status: "draft",
  },
  {
    name: "flash_sale_announcement",
    category: "MARKETING",
    language: "en",
    components: [
      { type: "HEADER", format: "IMAGE" },
      { type: "BODY",   text: "🔥 {{1}} FLASH SALE is LIVE!\n\nGet {{2}}% off on everything.\nOffer ends in {{3}} hours.\n\nUse code: *{{4}}*" },
      { type: "FOOTER", text: "Reply STOP to unsubscribe" },
      { type: "BUTTONS", buttons: [
        { type: "URL",        text: "Shop now",  url: "https://shop.example.com" },
        { type: "QUICK_REPLY", text: "Remind me" },
      ]},
    ],
    variable_labels: { "1": "brand name", "2": "discount %", "3": "hours remaining", "4": "promo code" },
    status: "draft",
  },
  {
    name: "appointment_reminder",
    category: "UTILITY",
    language: "en",
    components: [
      { type: "BODY",   text: "Hi {{1}}, this is a reminder for your appointment on *{{2}}* at *{{3}}*.\n\nLocation: {{4}}\n\nNeed to reschedule?" },
      { type: "BUTTONS", buttons: [
        { type: "QUICK_REPLY", text: "Confirm"     },
        { type: "QUICK_REPLY", text: "Reschedule"  },
      ]},
    ],
    variable_labels: { "1": "customer name", "2": "date", "3": "time", "4": "location" },
    status: "draft",
  },
  {
    name: "payment_receipt",
    category: "UTILITY",
    language: "en",
    components: [
      { type: "HEADER", format: "TEXT", text: "Payment received ✅" },
      { type: "BODY",   text: "Hi {{1}},\n\nWe've received your payment of ₹{{2}} for order #{{3}}.\n\nTransaction ID: {{4}}\nDate: {{5}}" },
      { type: "FOOTER", text: "Keep this as your receipt" },
    ],
    variable_labels: { "1": "customer name", "2": "amount", "3": "order ID", "4": "transaction ID", "5": "date" },
    status: "draft",
  },
] as const;

export async function seedTemplates(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<{ seeded: number; errors: string[] }> {
  let seeded = 0;
  const errors: string[] = [];

  for (const seed of SEEDS) {
    const { error } = await supabase
      .from("templates")
      .upsert(
        {
          user_id:         userId,
          name:            seed.name,
          category:        seed.category,
          language:        seed.language,
          components:      seed.components,
          variable_labels: seed.variable_labels,
          status:          seed.status,
        },
        { onConflict: "user_id,name,language", ignoreDuplicates: true }
      );

    if (error) {
      errors.push(`${seed.name}: ${error.message}`);
    } else {
      seeded++;
    }
  }

  return { seeded, errors };
}
