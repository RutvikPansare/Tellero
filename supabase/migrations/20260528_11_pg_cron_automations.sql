-- ============================================================
-- Migration 11 — Supabase pg_cron: Automation Queue Processor
--
-- Replaces Vercel Cron (which requires Pro plan for minute-level
-- scheduling) with Supabase pg_cron + pg_net — free on all plans.
--
-- What it does: every minute, calls the Next.js route
--   POST /api/cron/process-automations
-- which sends due WhatsApp automations (COD, abandoned cart,
-- order tracking, reorder reminders).
--
-- Prerequisites (already enabled on all Supabase projects):
--   - pg_cron extension
--   - pg_net extension
--
-- HOW TO RUN:
--   1. Open Supabase dashboard → SQL Editor
--   2. Paste and run this entire file
--   3. Verify under Database → Cron Jobs → "process-automations"
-- ============================================================

-- Enable required extensions (safe to run even if already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove existing job if re-running this migration
select cron.unschedule('process-automations')
where exists (
  select 1 from cron.job where jobname = 'process-automations'
);

-- Schedule the automation processor to run every minute
select cron.schedule(
  'process-automations',
  '* * * * *',
  $$
    select net.http_post(
      url     := 'https://app.tellero.in/api/cron/process-automations',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret', true),
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ── Alternative: hardcode the secret directly ─────────────────
-- If current_setting doesn't work, replace the headers line with:
--
--   headers := '{"Authorization": "Bearer YOUR_CRON_SECRET_HERE", "Content-Type": "application/json"}'::jsonb,
--
-- Replace YOUR_CRON_SECRET_HERE with the value from .env.local
-- ─────────────────────────────────────────────────────────────

-- Optional: set the secret as a Postgres config param so it's
-- not hardcoded in the job definition (run this first if using
-- the current_setting() approach above):
--
--   alter database postgres set app.cron_secret = 'YOUR_CRON_SECRET_HERE';
--
-- Then reconnect and run the cron.schedule() call above.

-- Verify the job was created
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'process-automations';
