-- ============================================================
-- Migration 14 — Feature 7: Abandoned Cart Recovery
-- Adds settings + a message_sent_at tracking column.
-- Requires: migration 10 (abandoned_checkouts, automation_queue).
-- ============================================================

-- ── 1. Add abandoned_cart_settings JSONB to profiles ────────
-- Shape: { enabled, delay_minutes, send_second_reminder, second_reminder_hours, template_name }
alter table public.profiles
  add column if not exists abandoned_cart_settings jsonb;

comment on column public.profiles.abandoned_cart_settings is
  'Abandoned cart recovery settings. Shape: { enabled: boolean, delay_minutes: number, send_second_reminder: boolean, second_reminder_hours: number, template_name: string }';


-- ── 2. Add recovery_revenue to abandoned_checkouts ──────────
-- Stores the order value when a cart is recovered — powers revenue stats.
alter table public.abandoned_checkouts
  add column if not exists recovery_revenue numeric(12,2);

comment on column public.abandoned_checkouts.recovery_revenue is
  'Order total when this checkout was recovered. Null if not yet recovered.';


-- ── 3. Add message_sent_at to abandoned_checkouts ───────────
-- Tracks when the WhatsApp recovery message was sent to the customer.
alter table public.abandoned_checkouts
  add column if not exists message_sent_at timestamptz;

comment on column public.abandoned_checkouts.message_sent_at is
  'When the abandoned cart WhatsApp message was sent. Null if not yet sent.';


-- ── 4. Extend automation_queue event_type CHECK ─────────────
-- Add abandoned_cart_reminder_2 for the optional second reminder.
alter table public.automation_queue
  drop constraint if exists automation_queue_event_type_check;

alter table public.automation_queue
  add constraint automation_queue_event_type_check
  check (event_type in (
    'cod_confirmation',
    'cod_timeout',
    'abandoned_cart',
    'abandoned_cart_reminder_2',
    'order_confirmed',
    'order_shipped',
    'order_cancelled',
    'reorder_reminder',
    'win_back'
  ));
