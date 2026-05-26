-- ============================================================
-- Migration 02 — contacts
-- WhatsApp opted-in customers synced from Shopify / CSV import.
-- Requires: migration 01 (profiles) already applied.
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.contacts (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- owner
  user_id        uuid        not null references public.profiles (id) on delete cascade,

  -- identity
  phone          text        not null,   -- E.164 format, e.g. +919876543210
  name           text,
  email          text,

  -- segmentation
  tags           text[]      not null default '{}',

  -- order history (synced from Shopify)
  last_order_at  timestamptz,
  total_orders   integer     not null default 0,
  total_spent    numeric(12,2) not null default 0,

  -- AI health score (0–100; higher = healthier)
  health_score   smallint    not null default 50
                             check (health_score between 0 and 100),

  -- WhatsApp opt-in status
  opted_in       boolean     not null default true,

  -- Shopify customer id for delta sync
  shopify_id     text,

  -- prevent duplicate phone numbers per brand
  unique (user_id, phone)
);

comment on table public.contacts is
  'WhatsApp opted-in customer list. One row per unique phone per brand.';
comment on column public.contacts.health_score is
  '0–100. Below 30 = at-risk, 30–70 = healthy, above 70 = VIP.';

-- ── 2. updated_at trigger ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.set_updated_at();

-- ── 3. Indexes ──────────────────────────────────────────────
create index if not exists contacts_user_id_idx     on public.contacts (user_id);
create index if not exists contacts_phone_idx       on public.contacts (phone);
create index if not exists contacts_health_idx      on public.contacts (user_id, health_score);
create index if not exists contacts_tags_idx        on public.contacts using gin (tags);
create index if not exists contacts_last_order_idx  on public.contacts (user_id, last_order_at desc nulls last);
create index if not exists contacts_shopify_id_idx  on public.contacts (user_id, shopify_id) where shopify_id is not null;

-- ── 4. Row-Level Security ───────────────────────────────────
alter table public.contacts enable row level security;

create policy "contacts: owner select"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "contacts: owner insert"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "contacts: owner update"
  on public.contacts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "contacts: owner delete"
  on public.contacts for delete
  using (auth.uid() = user_id);
