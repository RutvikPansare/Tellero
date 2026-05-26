-- ============================================================
-- Migration 06 — analytics_events
-- Immutable event log for revenue attribution. Every rupee
-- Tellero recovers is traced back to a specific event here.
-- Requires: migrations 02 (contacts), 03 (broadcasts).
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.analytics_events (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  user_id        uuid        not null references public.profiles (id) on delete cascade,
  contact_id     uuid        references public.contacts (id) on delete set null,

  -- what triggered this event
  source_type    text        not null
                 check (source_type in ('broadcast','automation','manual')),
  source_id      uuid,       -- broadcast_id or automation_id

  -- event kind
  event_type     text        not null
                 check (event_type in (
                   'message_sent',
                   'message_delivered',
                   'message_read',
                   'message_replied',
                   'order_placed',       -- conversion after a message
                   'cart_recovered',
                   'cod_confirmed',
                   'cod_cancelled',
                   'reorder_triggered',
                   'win_back_converted',
                   'opted_out'
                 )),

  -- revenue attributed to this event (₹)
  revenue        numeric(12,2) not null default 0,

  -- arbitrary metadata (order id, product name, etc.)
  metadata       jsonb        not null default '{}'
);

comment on table public.analytics_events is
  'Append-only event log. Revenue is attributed here for the dashboard ₹ figure.';

-- ── 2. Indexes ──────────────────────────────────────────────
-- Most queries filter by user + date range
create index if not exists ae_user_created_idx   on public.analytics_events (user_id, created_at desc);
create index if not exists ae_source_idx         on public.analytics_events (source_type, source_id);
create index if not exists ae_event_type_idx     on public.analytics_events (user_id, event_type);
create index if not exists ae_revenue_idx        on public.analytics_events (user_id, created_at desc)
  where revenue > 0;

-- ── 3. Row-Level Security ───────────────────────────────────
alter table public.analytics_events enable row level security;

create policy "analytics_events: owner select"
  on public.analytics_events for select
  using (auth.uid() = user_id);

-- Inserts only from service role (webhooks / API routes)

-- ── 4. Revenue summary view ─────────────────────────────────
-- Handy view for the dashboard ₹ card — no app-side aggregation needed.
create or replace view public.revenue_summary as
select
  user_id,
  date_trunc('month', created_at)                   as month,
  sum(revenue)                                      as total_revenue,
  count(*) filter (where event_type = 'cart_recovered')    as carts_recovered,
  count(*) filter (where event_type = 'cod_confirmed')     as cod_confirmed,
  count(*) filter (where event_type = 'reorder_triggered') as reorders,
  count(*) filter (where event_type = 'win_back_converted')as win_backs
from public.analytics_events
where revenue > 0
group by user_id, date_trunc('month', created_at);

comment on view public.revenue_summary is
  'Monthly revenue breakdown per user. Used by the dashboard ₹ stat card.';
