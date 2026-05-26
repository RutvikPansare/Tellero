-- ============================================================
-- Migration 04 — broadcast_recipients
-- Junction table: one row per (broadcast × contact) message.
-- Used to track per-message delivery status and prevent
-- double-sends. Also powers per-contact analytics.
-- Requires: migrations 02 (contacts) + 03 (broadcasts).
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.broadcast_recipients (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  broadcast_id  uuid        not null references public.broadcasts (id) on delete cascade,
  contact_id    uuid        not null references public.contacts    (id) on delete cascade,

  -- per-message delivery state
  status        text        not null default 'queued'
                            check (status in ('queued','sent','delivered','read','replied','failed','opted_out')),

  -- timestamps set by provider webhook
  sent_at       timestamptz,
  delivered_at  timestamptz,
  read_at       timestamptz,
  replied_at    timestamptz,
  failed_at     timestamptz,

  -- provider message id for webhook correlation
  provider_msg_id text,

  -- one row per contact per broadcast
  unique (broadcast_id, contact_id)
);

comment on table public.broadcast_recipients is
  'Per-message delivery tracking for each broadcast → contact pair.';

-- ── 2. updated_at trigger ───────────────────────────────────
drop trigger if exists broadcast_recipients_updated_at on public.broadcast_recipients;
create trigger broadcast_recipients_updated_at
  before update on public.broadcast_recipients
  for each row execute procedure public.set_updated_at();

-- ── 3. Indexes ──────────────────────────────────────────────
create index if not exists br_broadcast_id_idx  on public.broadcast_recipients (broadcast_id);
create index if not exists br_contact_id_idx    on public.broadcast_recipients (contact_id);
create index if not exists br_status_idx        on public.broadcast_recipients (broadcast_id, status);
create index if not exists br_provider_msg_idx  on public.broadcast_recipients (provider_msg_id)
  where provider_msg_id is not null;

-- ── 4. Row-Level Security ───────────────────────────────────
-- Access through the broadcast's user_id join — users can only
-- see recipients for their own broadcasts.
alter table public.broadcast_recipients enable row level security;

create policy "broadcast_recipients: owner select"
  on public.broadcast_recipients for select
  using (
    exists (
      select 1 from public.broadcasts b
      where b.id = broadcast_id
        and b.user_id = auth.uid()
    )
  );

-- Inserts and updates are performed by the service-role API route only.
-- No direct client insert/update policies → service role bypasses RLS.

-- ── 5. Aggregate update function ────────────────────────────
-- Called by the delivery webhook route after updating recipient rows
-- to keep the denormalized counters on broadcasts in sync.
create or replace function public.refresh_broadcast_stats(p_broadcast_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.broadcasts
  set
    total_recipients = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id),
    delivered        = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status in ('delivered','read','replied')),
    opened           = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status in ('read','replied')),
    replied          = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status = 'replied'),
    opted_out        = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status = 'opted_out'),
    updated_at       = now()
  where id = p_broadcast_id;
end;
$$;

comment on function public.refresh_broadcast_stats(uuid) is
  'Re-computes aggregate delivery counters on the broadcasts row from the recipients table.
   Call after processing a batch of webhook events.';
