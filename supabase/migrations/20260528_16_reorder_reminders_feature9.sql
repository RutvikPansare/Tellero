-- ============================================================
-- Migration 16 — Feature 9: Reorder Reminders (backend)
-- Adds source columns to automation_queue, opt-out to contacts,
-- and reorder_settings to profiles.
-- ============================================================

-- Add source tracking columns to automation_queue
alter table public.automation_queue
  add column if not exists source_order_id  uuid references public.orders(id) on delete set null,
  add column if not exists source_product_id text;

comment on column public.automation_queue.source_order_id  is
  'The specific order that triggered this reorder reminder';
comment on column public.automation_queue.source_product_id is
  'The Shopify product ID being reminded about (string to avoid int overflow)';

-- Add marketing opt-out to contacts
alter table public.contacts
  add column if not exists marketing_opted_out boolean default false,
  add column if not exists opted_out_at        timestamptz;

comment on column public.contacts.marketing_opted_out is
  'True when customer has replied STOP / opted out of marketing messages';
comment on column public.contacts.opted_out_at is
  'When the customer opted out';

-- Add reorder_settings to profiles (note: codebase has no brands table — everything on profiles)
alter table public.profiles
  add column if not exists reorder_settings jsonb default '{
    "enabled": false,
    "default_reminder_days": 30,
    "product_rules": [],
    "template_name": "reorder_reminder",
    "send_time": "09:00"
  }'::jsonb;

comment on column public.profiles.reorder_settings is
  'Reorder reminder settings. Shape: { enabled, default_reminder_days, product_rules: [{product_id, product_name, reminder_days, enabled}], template_name, send_time }';

-- Index for source_product_id lookups (duplicate guard + already-reordered check)
create index if not exists automation_queue_source_product_idx
  on public.automation_queue (user_id, source_product_id, status)
  where status = 'pending';
