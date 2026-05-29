-- ============================================================
-- Migration 15 — Feature 8: Order Confirmation + Tracking
-- Adds order_notification_settings JSONB to profiles.
-- Requires: migration 10 (orders, automation_queue).
-- ============================================================

-- Add order_notification_settings to profiles
alter table public.profiles
  add column if not exists order_notification_settings jsonb;

comment on column public.profiles.order_notification_settings is
  'Order notification settings. Shape: { order_confirmation_enabled, shipping_update_enabled, order_confirmation_template, shipping_update_template, include_items_in_confirmation, estimated_delivery_days }';
