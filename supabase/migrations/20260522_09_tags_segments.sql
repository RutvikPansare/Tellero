-- ─────────────────────────────────────────────────────────────
-- Migration 09: Tags + Audience Segmentation
-- Adds: tags, contact_tags, segments tables
--       JSONB attribute helpers, contact_count trigger
-- ─────────────────────────────────────────────────────────────

-- ── Tags ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  color         text        NOT NULL DEFAULT '#25D366',
  contact_count integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tags_owner_all" ON tags;
CREATE POLICY "tags_owner_all"
  ON tags FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Contact ↔ Tag join ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_tags_owner_all" ON contact_tags;
CREATE POLICY "contact_tags_owner_all"
  ON contact_tags FOR ALL
  USING (
    contact_id IN (
      SELECT id FROM contacts WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON contact_tags (contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag     ON contact_tags (tag_id);

-- ── Auto-update tag contact_count ────────────────────────────
CREATE OR REPLACE FUNCTION update_tag_contact_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET contact_count = contact_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET contact_count = GREATEST(contact_count - 1, 0) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tag_count_trigger ON contact_tags;
CREATE TRIGGER tag_count_trigger
  AFTER INSERT OR DELETE ON contact_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_contact_count();

-- ── Contacts: add missing columns ────────────────────────────
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS attributes     jsonb        NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_order_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_contacts_attributes ON contacts USING gin (attributes);

-- ── Segments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS segments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text        NOT NULL,
  description         text,
  filters             jsonb       NOT NULL DEFAULT '[]',
  conjunction         text        NOT NULL DEFAULT 'AND' CHECK (conjunction IN ('AND','OR')),
  contact_count       integer     NOT NULL DEFAULT 0,
  last_calculated_at  timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "segments_owner_all" ON segments;
CREATE POLICY "segments_owner_all"
  ON segments FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_segments_user ON segments (user_id);

CREATE OR REPLACE FUNCTION update_segments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS segments_updated_at ON segments;
CREATE TRIGGER segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_segments_updated_at();

-- ── JSONB attribute helpers (RPC) ─────────────────────────────
CREATE OR REPLACE FUNCTION set_contact_attribute(
  p_contact_id uuid,
  p_key        text,
  p_value      text
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE contacts
  SET attributes = attributes || jsonb_build_object(p_key, p_value)
  WHERE id = p_contact_id
    AND user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION delete_contact_attribute(
  p_contact_id uuid,
  p_key        text
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE contacts
  SET attributes = attributes - p_key
  WHERE id = p_contact_id
    AND user_id = auth.uid();
$$;
