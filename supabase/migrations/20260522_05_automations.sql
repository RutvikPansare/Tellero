-- ============================================================
-- Migration 05 — automations
-- Stores the three core Tellero automation configs per brand:
--   • COD confirmation (trigger: new COD order)
--   • Abandoned cart recovery (trigger: cart abandoned N hours)
--   • Reorder reminder (trigger: N days since last order)
-- Requires: migration 01 (profiles).
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
create table if not exists public.automations (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  user_id      uuid        not null references public.profiles (id) on delete cascade,

  -- automation type
  type         text        not null
               check (type in ('cod_confirmation','abandoned_cart','reorder_reminder','win_back')),

  -- toggle
  enabled      boolean     not null default false,

  -- message template (supports {{name}}, {{link}}, {{product}})
  message      text        not null default '',

  -- type-specific config stored as JSON
  -- cod_confirmation:  { "confirm_window_hours": 24 }
  -- abandoned_cart:    { "delay_hours": 1, "max_sends": 2 }
  -- reorder_reminder:  { "delay_days": 25 }
  -- win_back:          { "inactive_days": 60, "discount_pct": 15 }
  config       jsonb       not null default '{}',

  -- stats (rolling 30-day)
  sends_30d    integer     not null default 0,
  revenue_30d  numeric(12,2) not null default 0,

  -- one automation type per brand
  unique (user_id, type)
);

comment on table public.automations is
  'Per-brand automation configuration for COD, cart, reorder, and win-back flows.';

-- ── 2. updated_at trigger ───────────────────────────────────
drop trigger if exists automations_updated_at on public.automations;
create trigger automations_updated_at
  before update on public.automations
  for each row execute procedure public.set_updated_at();

-- ── 3. Seed default rows for new users ──────────────────────
-- Called from handle_new_user() after profile insert.
create or replace function public.seed_automations(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.automations (user_id, type, message, config) values
  (
    p_user_id,
    'cod_confirmation',
    'Hi {{name}} 👋 You have a COD order for ₹{{amount}} on its way. Reply YES to confirm or NO to cancel.',
    '{"confirm_window_hours": 24}'
  ),
  (
    p_user_id,
    'abandoned_cart',
    'Hey {{name}}! You left something behind 🛒 Your cart is still waiting. Grab it before it sells out: {{link}}',
    '{"delay_hours": 1, "max_sends": 2}'
  ),
  (
    p_user_id,
    'reorder_reminder',
    'Hi {{name}} 👋 Time to stock up on {{product}}? Reorder in one tap: {{link}}',
    '{"delay_days": 25}'
  ),
  (
    p_user_id,
    'win_back',
    'We miss you, {{name}}! 💚 It''s been a while. Here''s {{discount}}% off — just for you: {{link}}',
    '{"inactive_days": 60, "discount_pct": 15}'
  )
  on conflict (user_id, type) do nothing;
end;
$$;

-- Wire seed into the sign-up trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;

  perform public.seed_automations(new.id);

  return new;
end;
$$;

-- ── 4. Indexes ──────────────────────────────────────────────
create index if not exists automations_user_id_idx on public.automations (user_id);
create index if not exists automations_enabled_idx on public.automations (user_id, enabled) where enabled = true;

-- ── 5. Row-Level Security ───────────────────────────────────
alter table public.automations enable row level security;

create policy "automations: owner select"
  on public.automations for select
  using (auth.uid() = user_id);

create policy "automations: owner update"
  on public.automations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
