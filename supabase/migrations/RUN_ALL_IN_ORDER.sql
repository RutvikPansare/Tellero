-- ============================================================
-- Tellero — Full Database Setup
-- Paste this entire file into Supabase → SQL Editor → Run
--
-- Order matters — do NOT reorder the sections.
-- Safe to re-run: uses IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- ============================================================


-- ══════════════════════════════════════════════════════════
-- 01  PROFILES
-- ══════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id              uuid        primary key references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  email           text        not null,
  full_name       text,
  brand_name      text,
  whatsapp_number text,
  plan            text        not null default 'free'
                              check (plan in ('free','starter','growth','scale'))
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner select" on public.profiles;
create policy "profiles: owner select"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles: owner update" on public.profiles;
create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);


-- ══════════════════════════════════════════════════════════
-- 02  CONTACTS
-- ══════════════════════════════════════════════════════════

create table if not exists public.contacts (
  id             uuid          primary key default gen_random_uuid(),
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now(),
  user_id        uuid          not null references public.profiles (id) on delete cascade,
  phone          text          not null,
  name           text,
  email          text,
  tags           text[]        not null default '{}',
  last_order_at  timestamptz,
  total_orders   integer       not null default 0,
  total_spent    numeric(12,2) not null default 0,
  health_score   smallint      not null default 50 check (health_score between 0 and 100),
  opted_in       boolean       not null default true,
  shopify_id     text,
  unique (user_id, phone)
);

-- shared updated_at function (used by all tables below)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.set_updated_at();

create index if not exists contacts_user_id_idx    on public.contacts (user_id);
create index if not exists contacts_phone_idx      on public.contacts (phone);
create index if not exists contacts_health_idx     on public.contacts (user_id, health_score);
create index if not exists contacts_tags_idx       on public.contacts using gin (tags);
create index if not exists contacts_last_order_idx on public.contacts (user_id, last_order_at desc nulls last);
create index if not exists contacts_shopify_id_idx on public.contacts (user_id, shopify_id) where shopify_id is not null;

alter table public.contacts enable row level security;

drop policy if exists "contacts: owner select" on public.contacts;
create policy "contacts: owner select" on public.contacts for select using (auth.uid() = user_id);
drop policy if exists "contacts: owner insert" on public.contacts;
create policy "contacts: owner insert" on public.contacts for insert with check (auth.uid() = user_id);
drop policy if exists "contacts: owner update" on public.contacts;
create policy "contacts: owner update" on public.contacts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "contacts: owner delete" on public.contacts;
create policy "contacts: owner delete" on public.contacts for delete using (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 03  BROADCASTS
-- ══════════════════════════════════════════════════════════

create table if not exists public.broadcasts (
  id                uuid          primary key default gen_random_uuid(),
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now(),
  user_id           uuid          not null references public.profiles (id) on delete cascade,
  name              text          not null,
  message           text          not null,
  segment           text          not null,
  status            text          not null default 'draft'
                                  check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_at      timestamptz,
  sent_at           timestamptz,
  total_recipients  integer       not null default 0,
  delivered         integer       not null default 0,
  opened            integer       not null default 0,
  replied           integer       not null default 0,
  opted_out         integer       not null default 0,
  provider_batch_id text,
  archived_at       timestamptz
);

drop trigger if exists broadcasts_updated_at on public.broadcasts;
create trigger broadcasts_updated_at
  before update on public.broadcasts
  for each row execute procedure public.set_updated_at();

create index if not exists broadcasts_user_id_idx   on public.broadcasts (user_id);
create index if not exists broadcasts_status_idx    on public.broadcasts (user_id, status);
create index if not exists broadcasts_sent_at_idx   on public.broadcasts (user_id, sent_at desc nulls last);
create index if not exists broadcasts_scheduled_idx on public.broadcasts (scheduled_at) where status = 'scheduled';

alter table public.broadcasts enable row level security;

drop policy if exists "broadcasts: owner select" on public.broadcasts;
create policy "broadcasts: owner select" on public.broadcasts for select using (auth.uid() = user_id);
drop policy if exists "broadcasts: owner insert" on public.broadcasts;
create policy "broadcasts: owner insert" on public.broadcasts for insert with check (auth.uid() = user_id);
drop policy if exists "broadcasts: owner update" on public.broadcasts;
create policy "broadcasts: owner update" on public.broadcasts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "broadcasts: owner delete" on public.broadcasts;
create policy "broadcasts: owner delete" on public.broadcasts for delete using (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 04  BROADCAST RECIPIENTS
-- ══════════════════════════════════════════════════════════

create table if not exists public.broadcast_recipients (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  broadcast_id    uuid        not null references public.broadcasts (id) on delete cascade,
  contact_id      uuid        not null references public.contacts   (id) on delete cascade,
  status          text        not null default 'queued'
                              check (status in ('queued','sent','delivered','read','replied','failed','opted_out')),
  sent_at         timestamptz,
  delivered_at    timestamptz,
  read_at         timestamptz,
  replied_at      timestamptz,
  failed_at       timestamptz,
  provider_msg_id text,
  unique (broadcast_id, contact_id)
);

drop trigger if exists broadcast_recipients_updated_at on public.broadcast_recipients;
create trigger broadcast_recipients_updated_at
  before update on public.broadcast_recipients
  for each row execute procedure public.set_updated_at();

create index if not exists br_broadcast_id_idx on public.broadcast_recipients (broadcast_id);
create index if not exists br_contact_id_idx   on public.broadcast_recipients (contact_id);
create index if not exists br_status_idx       on public.broadcast_recipients (broadcast_id, status);
create index if not exists br_provider_msg_idx on public.broadcast_recipients (provider_msg_id) where provider_msg_id is not null;

alter table public.broadcast_recipients enable row level security;

drop policy if exists "broadcast_recipients: owner select" on public.broadcast_recipients;
create policy "broadcast_recipients: owner select"
  on public.broadcast_recipients for select
  using (
    exists (
      select 1 from public.broadcasts b
      where b.id = broadcast_id and b.user_id = auth.uid()
    )
  );

-- Aggregate helper
create or replace function public.refresh_broadcast_stats(p_broadcast_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.broadcasts set
    total_recipients = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id),
    delivered        = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status in ('delivered','read','replied')),
    opened           = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status in ('read','replied')),
    replied          = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status = 'replied'),
    opted_out        = (select count(*) from public.broadcast_recipients where broadcast_id = p_broadcast_id and status = 'opted_out'),
    updated_at       = now()
  where id = p_broadcast_id;
end;
$$;


-- ══════════════════════════════════════════════════════════
-- 05  AUTOMATIONS
-- ══════════════════════════════════════════════════════════

create table if not exists public.automations (
  id           uuid          primary key default gen_random_uuid(),
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now(),
  user_id      uuid          not null references public.profiles (id) on delete cascade,
  type         text          not null
               check (type in ('cod_confirmation','abandoned_cart','reorder_reminder','win_back')),
  enabled      boolean       not null default false,
  message      text          not null default '',
  config       jsonb         not null default '{}',
  sends_30d    integer       not null default 0,
  revenue_30d  numeric(12,2) not null default 0,
  unique (user_id, type)
);

drop trigger if exists automations_updated_at on public.automations;
create trigger automations_updated_at
  before update on public.automations
  for each row execute procedure public.set_updated_at();

create index if not exists automations_user_id_idx on public.automations (user_id);
create index if not exists automations_enabled_idx on public.automations (user_id, enabled) where enabled = true;

alter table public.automations enable row level security;

drop policy if exists "automations: owner select" on public.automations;
create policy "automations: owner select" on public.automations for select using (auth.uid() = user_id);
drop policy if exists "automations: owner update" on public.automations;
create policy "automations: owner update" on public.automations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.seed_automations(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.automations (user_id, type, message, config) values
  (p_user_id, 'cod_confirmation',
    'Hi {{name}} 👋 You have a COD order for ₹{{amount}} on its way. Reply YES to confirm or NO to cancel.',
    '{"confirm_window_hours": 24}'),
  (p_user_id, 'abandoned_cart',
    'Hey {{name}}! You left something behind 🛒 Your cart is still waiting. Grab it before it sells out: {{link}}',
    '{"delay_hours": 1, "max_sends": 2}'),
  (p_user_id, 'reorder_reminder',
    'Hi {{name}} 👋 Time to stock up on {{product}}? Reorder in one tap: {{link}}',
    '{"delay_days": 25}'),
  (p_user_id, 'win_back',
    E'We miss you, {{name}}! 💚 It''s been a while. Here''s {{discount}}% off — just for you: {{link}}',
    '{"inactive_days": 60, "discount_pct": 15}')
  on conflict (user_id, type) do nothing;
end;
$$;


-- ══════════════════════════════════════════════════════════
-- 06  ANALYTICS EVENTS
-- ══════════════════════════════════════════════════════════

create table if not exists public.analytics_events (
  id           uuid          primary key default gen_random_uuid(),
  created_at   timestamptz   not null default now(),
  user_id      uuid          not null references public.profiles (id) on delete cascade,
  contact_id   uuid          references public.contacts (id) on delete set null,
  source_type  text          not null check (source_type in ('broadcast','automation','manual')),
  source_id    uuid,
  event_type   text          not null check (event_type in (
    'message_sent','message_delivered','message_read','message_replied',
    'order_placed','cart_recovered','cod_confirmed','cod_cancelled',
    'reorder_triggered','win_back_converted','opted_out'
  )),
  revenue      numeric(12,2) not null default 0,
  metadata     jsonb         not null default '{}'
);

create index if not exists ae_user_created_idx on public.analytics_events (user_id, created_at desc);
create index if not exists ae_source_idx       on public.analytics_events (source_type, source_id);
create index if not exists ae_event_type_idx   on public.analytics_events (user_id, event_type);
create index if not exists ae_revenue_idx      on public.analytics_events (user_id, created_at desc) where revenue > 0;

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_events: owner select" on public.analytics_events;
create policy "analytics_events: owner select"
  on public.analytics_events for select using (auth.uid() = user_id);

create or replace view public.revenue_summary as
select
  user_id,
  date_trunc('month', created_at)                              as month,
  sum(revenue)                                                 as total_revenue,
  count(*) filter (where event_type = 'cart_recovered')        as carts_recovered,
  count(*) filter (where event_type = 'cod_confirmed')         as cod_confirmed,
  count(*) filter (where event_type = 'reorder_triggered')     as reorders,
  count(*) filter (where event_type = 'win_back_converted')    as win_backs
from public.analytics_events
where revenue > 0
group by user_id, date_trunc('month', created_at);


-- ══════════════════════════════════════════════════════════
-- 07  SHOPIFY STORES
-- ══════════════════════════════════════════════════════════

create table if not exists public.shopify_stores (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  user_id           uuid        not null references public.profiles (id) on delete cascade,
  shop_domain       text        not null,
  access_token      text        not null,
  webhook_secret    text,
  sync_status       text        not null default 'pending'
                                check (sync_status in ('pending','syncing','synced','error')),
  last_synced_at    timestamptz,
  last_order_cursor text,
  sync_error        text,
  contacts_synced   integer     not null default 0,
  unique (user_id, shop_domain)
);

drop trigger if exists shopify_stores_updated_at on public.shopify_stores;
create trigger shopify_stores_updated_at
  before update on public.shopify_stores
  for each row execute procedure public.set_updated_at();

create index if not exists shopify_stores_user_id_idx on public.shopify_stores (user_id);
create index if not exists shopify_stores_domain_idx  on public.shopify_stores (shop_domain);

alter table public.shopify_stores enable row level security;

drop policy if exists "shopify_stores: owner select" on public.shopify_stores;
create policy "shopify_stores: owner select" on public.shopify_stores for select using (auth.uid() = user_id);
drop policy if exists "shopify_stores: owner update" on public.shopify_stores;
create policy "shopify_stores: owner update" on public.shopify_stores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 08  AUTH TRIGGER — wire everything to sign-up
--     Must be last so all tables + functions exist.
-- ══════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public
as $$
begin
  -- create profile
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;

  -- seed default automations
  perform public.seed_automations(new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ══════════════════════════════════════════════════════════
-- 08  MESSAGE TEMPLATES
-- ══════════════════════════════════════════════════════════

do $$ begin
  if not exists (select 1 from pg_type where typname = 'template_status') then
    create type template_status as enum ('draft','pending','approved','rejected','paused');
  end if;
  if not exists (select 1 from pg_type where typname = 'template_category') then
    create type template_category as enum ('MARKETING','UTILITY','AUTHENTICATION');
  end if;
end $$;

create table if not exists templates (
  id                uuid              primary key default gen_random_uuid(),
  user_id           uuid              not null references profiles(id) on delete cascade,
  name              text              not null,
  category          template_category not null,
  language          text              not null default 'en',
  components        jsonb             not null default '[]'::jsonb,
  variable_labels   jsonb             not null default '{}'::jsonb,
  meta_template_id  text,
  status            template_status   not null default 'draft',
  rejection_reason  text,
  submitted_at      timestamptz,
  approved_at       timestamptz,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now()
);

create unique index if not exists templates_user_name_lang_uidx
  on templates (user_id, name, language);

create index if not exists templates_user_status_idx on templates (user_id, status);
create index if not exists templates_meta_id_idx     on templates (meta_template_id) where meta_template_id is not null;

create or replace function update_templates_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists templates_updated_at_trigger on templates;
create trigger templates_updated_at_trigger
  before update on templates
  for each row execute function update_templates_updated_at();

alter table templates enable row level security;

drop policy if exists "templates_owner_all" on templates;
create policy "templates_owner_all"
  on templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- Done! ✓
-- Tables:   profiles, contacts, broadcasts,
--           broadcast_recipients, automations,
--           analytics_events, shopify_stores, templates
-- Views:    revenue_summary
-- Triggers: on_auth_user_created (auto profile + automations)
--           updated_at on all mutable tables
-- Functions: set_updated_at, handle_new_user, seed_automations,
--            refresh_broadcast_stats, update_templates_updated_at
-- RLS:      enabled on all tables, owner-scoped policies
-- ══════════════════════════════════════════════════════════
