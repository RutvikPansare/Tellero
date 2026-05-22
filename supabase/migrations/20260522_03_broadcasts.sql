-- ============================================================
-- Migration 03 — broadcasts
-- WhatsApp campaign records with delivery analytics.
-- Requires: migration 01 (profiles) already applied.
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.broadcasts (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- owner
  user_id           uuid        not null references public.profiles (id) on delete cascade,

  -- content
  name              text        not null,
  message           text        not null,

  -- targeting
  segment           text        not null,   -- 'all' | 'at_risk' | 'vip' | 'cart' | 'cod' | 'repeat'

  -- lifecycle
  status            text        not null default 'draft'
                                check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_at      timestamptz,            -- set when status = 'scheduled'
  sent_at           timestamptz,            -- set when status = 'sent'

  -- delivery analytics (updated by webhook from WhatsApp provider)
  total_recipients  integer     not null default 0,
  delivered         integer     not null default 0,
  opened            integer     not null default 0,
  replied           integer     not null default 0,
  opted_out         integer     not null default 0,

  -- optional: id returned by WhatsApp provider for status webhooks
  provider_batch_id text,

  -- soft-delete
  archived_at       timestamptz
);

comment on table public.broadcasts is
  'WhatsApp broadcast campaigns. Analytics columns updated by provider webhook.';
comment on column public.broadcasts.segment is
  'Segment slug: all | at_risk | vip | cart | cod | repeat — resolved to contact list at send time.';

-- ── 2. updated_at trigger ───────────────────────────────────
drop trigger if exists broadcasts_updated_at on public.broadcasts;
create trigger broadcasts_updated_at
  before update on public.broadcasts
  for each row execute procedure public.set_updated_at();
-- Note: set_updated_at() function created in migration 02.

-- ── 3. Indexes ──────────────────────────────────────────────
create index if not exists broadcasts_user_id_idx    on public.broadcasts (user_id);
create index if not exists broadcasts_status_idx     on public.broadcasts (user_id, status);
create index if not exists broadcasts_sent_at_idx    on public.broadcasts (user_id, sent_at desc nulls last);
create index if not exists broadcasts_scheduled_idx  on public.broadcasts (scheduled_at)
  where status = 'scheduled';

-- ── 4. Row-Level Security ───────────────────────────────────
alter table public.broadcasts enable row level security;

create policy "broadcasts: owner select"
  on public.broadcasts for select
  using (auth.uid() = user_id);

create policy "broadcasts: owner insert"
  on public.broadcasts for insert
  with check (auth.uid() = user_id);

create policy "broadcasts: owner update"
  on public.broadcasts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "broadcasts: owner delete"
  on public.broadcasts for delete
  using (auth.uid() = user_id);
