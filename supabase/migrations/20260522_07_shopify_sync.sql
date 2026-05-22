-- ============================================================
-- Migration 07 — shopify_sync
-- Stores Shopify store connection state and the last sync
-- cursor so the background job can do delta syncs.
-- Requires: migration 01 (profiles).
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.shopify_stores (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  user_id           uuid        not null references public.profiles (id) on delete cascade,

  -- Shopify store domain, e.g. "yourstore.myshopify.com"
  shop_domain       text        not null,

  -- OAuth tokens (encrypted at rest by Supabase Vault in production)
  access_token      text        not null,

  -- Webhook HMAC secret for verifying Shopify webhook payloads
  webhook_secret    text,

  -- Sync state
  sync_status       text        not null default 'pending'
                                check (sync_status in ('pending','syncing','synced','error')),
  last_synced_at    timestamptz,
  last_order_cursor text,       -- Shopify cursor for incremental order sync
  sync_error        text,       -- last error message if sync_status = 'error'

  -- Counts from last sync
  contacts_synced   integer     not null default 0,

  unique (user_id, shop_domain)
);

comment on table public.shopify_stores is
  'Shopify OAuth connection per brand. One brand may have one store.';

-- ── 2. updated_at trigger ───────────────────────────────────
drop trigger if exists shopify_stores_updated_at on public.shopify_stores;
create trigger shopify_stores_updated_at
  before update on public.shopify_stores
  for each row execute procedure public.set_updated_at();

-- ── 3. Indexes ──────────────────────────────────────────────
create index if not exists shopify_stores_user_id_idx    on public.shopify_stores (user_id);
create index if not exists shopify_stores_domain_idx     on public.shopify_stores (shop_domain);

-- ── 4. Row-Level Security ───────────────────────────────────
alter table public.shopify_stores enable row level security;

create policy "shopify_stores: owner select"
  on public.shopify_stores for select
  using (auth.uid() = user_id);

create policy "shopify_stores: owner update"
  on public.shopify_stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts done by service role (OAuth callback route)
-- Deletes done by service role (disconnect flow)
