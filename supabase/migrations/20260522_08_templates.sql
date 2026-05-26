-- ─────────────────────────────────────────────────────────────
-- Migration 08: Message Templates
-- WhatsApp Business API message templates
-- ─────────────────────────────────────────────────────────────

create type template_status   as enum ('draft','pending','approved','rejected','paused');
create type template_category as enum ('MARKETING','UTILITY','AUTHENTICATION');

create table templates (
  id                uuid             primary key default gen_random_uuid(),
  user_id           uuid             not null references profiles(id) on delete cascade,

  -- Identity
  name              text             not null,
  category          template_category not null,
  language          text             not null default 'en',

  -- Content (stored as Meta components JSON)
  components        jsonb            not null default '[]'::jsonb,

  -- Variable human-readable labels { "1": "customer name", "2": "order id" }
  variable_labels   jsonb            not null default '{}'::jsonb,

  -- Meta integration
  meta_template_id  text,           -- returned by Meta after submission
  status            template_status  not null default 'draft',
  rejection_reason  text,

  -- Timestamps
  submitted_at      timestamptz,
  approved_at       timestamptz,
  created_at        timestamptz      not null default now(),
  updated_at        timestamptz      not null default now()
);

-- Unique: one template per name+language per user
create unique index templates_user_name_lang_uidx
  on templates (user_id, name, language);

-- Fast lookups
create index templates_user_status_idx on templates (user_id, status);
create index templates_meta_id_idx     on templates (meta_template_id) where meta_template_id is not null;

-- Auto-update updated_at
create or replace function update_templates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger templates_updated_at_trigger
  before update on templates
  for each row execute function update_templates_updated_at();

-- ── Row Level Security ────────────────────────────────────────
alter table templates enable row level security;

create policy "templates_owner_all"
  on templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
