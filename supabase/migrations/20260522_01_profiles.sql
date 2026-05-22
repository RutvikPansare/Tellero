-- ============================================================
-- Migration 01 — profiles
-- Run first. Creates the profiles table and wires it to
-- auth.users so a row is auto-created on every sign-up.
-- ============================================================

-- ── 1. Table ────────────────────────────────────────────────
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

comment on table public.profiles is
  'One row per Supabase auth user. Extend this for brand settings.';

-- ── 2. Indexes ──────────────────────────────────────────────
create index if not exists profiles_email_idx on public.profiles (email);

-- ── 3. Row-Level Security ───────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read and update their own profile only
create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role bypasses RLS (used by admin client in API routes)
-- No explicit policy needed — service key bypasses RLS automatically.

-- ── 4. Auto-create profile on sign-up ───────────────────────
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
  return new;
end;
$$;

-- Drop and recreate trigger so this migration is re-runnable
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
