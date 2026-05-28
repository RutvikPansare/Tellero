-- ============================================================
-- Migration 10 — Feature 11: Shopify Integration
-- Creates the core tables for Shopify OAuth, order sync,
-- abandoned checkouts, and the automation execution queue.
-- Requires: migrations 01 (profiles), 02 (contacts).
-- ============================================================

-- ── 1. shopify_connections ───────────────────────────────────
-- Full OAuth connection record with registered webhook IDs
create table if not exists public.shopify_connections (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  user_id          uuid        not null references public.profiles (id) on delete cascade,

  shop_domain      text        not null,           -- e.g. "mybrand.myshopify.com"
  access_token     text        not null,            -- Shopify OAuth access token
  scope            text,                            -- granted OAuth scopes
  webhook_ids      jsonb       not null default '{}', -- { orders_create: 123, ... }
  is_active        boolean     not null default true,
  installed_at     timestamptz not null default now(),
  last_webhook_at  timestamptz,                     -- last time any webhook fired

  unique (user_id)
);

comment on table public.shopify_connections is
  'Shopify OAuth connection per user. One connection per brand. Stores webhook IDs for management.';

drop trigger if exists shopify_connections_updated_at on public.shopify_connections;
create trigger shopify_connections_updated_at
  before update on public.shopify_connections
  for each row execute procedure public.set_updated_at();

create index if not exists shopify_connections_user_id_idx   on public.shopify_connections (user_id);
create index if not exists shopify_connections_domain_idx    on public.shopify_connections (shop_domain);

alter table public.shopify_connections enable row level security;

create policy "shopify_connections: owner select"
  on public.shopify_connections for select
  using (auth.uid() = user_id);

create policy "shopify_connections: owner update"
  on public.shopify_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts and service operations done by service role (OAuth callback, webhooks)


-- ── 2. orders ────────────────────────────────────────────────
-- Orders synced from Shopify webhooks
create table if not exists public.orders (
  id                   uuid        primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),

  user_id              uuid        not null references public.profiles (id) on delete cascade,
  shopify_order_id     text        not null,
  shopify_order_number text,                        -- e.g. "#1001"
  contact_id           uuid        references public.contacts (id),

  customer_phone       text,
  customer_name        text,
  customer_email       text,

  total_price          numeric(12,2) not null default 0,
  currency             text        not null default 'INR',
  payment_gateway      text,                        -- 'Cash on Delivery', 'Razorpay', etc.
  financial_status     text,                        -- 'pending', 'paid', 'refunded'
  fulfillment_status   text,                        -- 'unfulfilled', 'fulfilled', 'partial'

  line_items           jsonb       not null default '[]',
  shipping_address     jsonb,

  tracking_number      text,
  tracking_url         text,
  cancel_reason        text,

  shopify_created_at   timestamptz,
  shopify_updated_at   timestamptz,

  unique (user_id, shopify_order_id)
);

comment on table public.orders is
  'Orders synced from Shopify via webhooks. Source of truth for automations.';

create index if not exists orders_user_id_idx      on public.orders (user_id);
create index if not exists orders_shopify_id_idx   on public.orders (shopify_order_id);
create index if not exists orders_phone_idx        on public.orders (customer_phone);
create index if not exists orders_created_idx      on public.orders (user_id, shopify_created_at desc);
create index if not exists orders_contact_id_idx   on public.orders (contact_id);

alter table public.orders enable row level security;

create policy "orders: owner select"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders: owner update"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── 3. abandoned_checkouts ───────────────────────────────────
-- Checkouts that were created but not completed
create table if not exists public.abandoned_checkouts (
  id                     uuid        primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),

  user_id                uuid        not null references public.profiles (id) on delete cascade,
  shopify_checkout_id    text        not null,
  contact_id             uuid        references public.contacts (id),

  customer_phone         text,
  customer_name          text,
  customer_email         text,

  total_price            numeric(12,2) not null default 0,
  line_items             jsonb       not null default '[]',
  abandoned_checkout_url text,                      -- Shopify recovery URL

  recovered              boolean     not null default false,
  recovered_at           timestamptz,

  shopify_created_at     timestamptz,

  unique (user_id, shopify_checkout_id)
);

comment on table public.abandoned_checkouts is
  'Abandoned Shopify checkouts. recovered=true when customer completes purchase.';

create index if not exists abandoned_checkouts_user_id_idx   on public.abandoned_checkouts (user_id);
create index if not exists abandoned_checkouts_phone_idx     on public.abandoned_checkouts (customer_phone);
create index if not exists abandoned_checkouts_recovered_idx on public.abandoned_checkouts (user_id, recovered) where recovered = false;

alter table public.abandoned_checkouts enable row level security;

create policy "abandoned_checkouts: owner select"
  on public.abandoned_checkouts for select
  using (auth.uid() = user_id);


-- ── 4. automation_queue ──────────────────────────────────────
-- Execution queue for all WhatsApp automation messages.
-- Processed every minute by Vercel Cron → /api/cron/process-automations
create table if not exists public.automation_queue (
  id                  uuid        primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  user_id             uuid        not null references public.profiles (id) on delete cascade,

  event_type          text        not null check (event_type in (
                        'cod_confirmation',
                        'abandoned_cart',
                        'order_confirmed',
                        'order_shipped',
                        'order_cancelled',
                        'reorder_reminder',
                        'win_back'
                      )),

  -- Source references
  order_id            uuid        references public.orders (id) on delete cascade,
  checkout_id         uuid        references public.abandoned_checkouts (id) on delete cascade,
  contact_id          uuid        references public.contacts (id),

  -- Scheduling
  scheduled_for       timestamptz not null,
  status              text        not null default 'pending'
                                  check (status in ('pending','processing','sent','cancelled','failed')),

  -- Message payload
  template_name       text,
  template_variables  jsonb       not null default '{}',
  recipient_phone     text        not null,

  -- Result tracking
  whatsapp_message_id text,
  sent_at             timestamptz,
  error_message       text,
  retry_count         integer     not null default 0
);

comment on table public.automation_queue is
  'Pending and sent automation messages. The central nervous system for Features 6-9.';

create index if not exists automation_queue_pending_idx   on public.automation_queue (user_id, status, scheduled_for) where status = 'pending';
create index if not exists automation_queue_scheduled_idx on public.automation_queue (scheduled_for) where status = 'pending';
create index if not exists automation_queue_contact_idx   on public.automation_queue (contact_id);

alter table public.automation_queue enable row level security;

create policy "automation_queue: owner select"
  on public.automation_queue for select
  using (auth.uid() = user_id);


-- ── 5. RPC functions ─────────────────────────────────────────

-- Increment contact order stats when a new order arrives via webhook
create or replace function public.increment_contact_orders(
  p_contact_id  uuid,
  p_order_value numeric,
  p_order_date  timestamptz
) returns void
language sql
security definer set search_path = public
as $$
  update public.contacts set
    total_orders = total_orders + 1,
    total_spent  = total_spent + p_order_value,
    last_order_at = greatest(coalesce(last_order_at, p_order_date), p_order_date),
    updated_at   = now()
  where id = p_contact_id;
$$;

-- Mark abandoned checkout as recovered when a matching order arrives
create or replace function public.mark_checkout_recovered(
  p_user_id      uuid,
  p_customer_phone text
) returns void
language sql
security definer set search_path = public
as $$
  update public.abandoned_checkouts set
    recovered    = true,
    recovered_at = now()
  where user_id = p_user_id
    and customer_phone = p_customer_phone
    and recovered = false
    and shopify_created_at > now() - interval '24 hours';
$$;
