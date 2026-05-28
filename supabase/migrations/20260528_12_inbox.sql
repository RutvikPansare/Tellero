-- Feature 5: Multi-Agent Live Inbox
-- conversations: one row per unique customer↔brand WhatsApp thread
-- messages:      one row per individual message in a thread
-- Phone numbers stored in E.164 format: +91XXXXXXXXXX (consistent with contacts table)

-- ─── conversations ────────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id           uuid        REFERENCES contacts(id) ON DELETE SET NULL,
  customer_phone       text        NOT NULL,
  customer_name        text,
  status               text        NOT NULL DEFAULT 'open'
                                   CHECK (status IN ('open', 'assigned', 'resolved')),
  assigned_to          uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at      timestamptz,
  last_message_preview text,
  unread_count         integer     NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, customer_phone)
);

CREATE INDEX idx_conversations_user_id_last_msg
  ON conversations (user_id, last_message_at DESC NULLS LAST);

CREATE INDEX idx_conversations_user_id_status
  ON conversations (user_id, status);

-- ─── messages ────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction       text        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body            text        NOT NULL,
  meta_message_id text        UNIQUE,   -- wamid from Meta; UNIQUE enables ON CONFLICT DO NOTHING dedup
  status          text        NOT NULL DEFAULT 'sent'
                              CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id
  ON messages (conversation_id, created_at ASC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Conversations: owner only
CREATE POLICY "owner_select_conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: access via conversation ownership
CREATE POLICY "owner_select_messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_insert_messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_update_messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    )
  );

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Both tables must be in the publication for live updates to work
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
