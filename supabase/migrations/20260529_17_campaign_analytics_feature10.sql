-- ============================================================
-- Migration 17 — Campaign Analytics (Feature 10): Data Collection
-- Adds delivery status tracking to messages, automation_queue,
-- and broadcast_recipients. Adds RPCs for atomic status updates.
-- Requires: migrations 04 (broadcast_recipients), 12 (messages),
--           05/11 (automation_queue).
-- ============================================================

-- ── 1. Delivery timestamp columns on messages table ──────────
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS delivered_at  timestamptz,
  ADD COLUMN IF NOT EXISTS read_at       timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at     timestamptz,
  ADD COLUMN IF NOT EXISTS error_code    text,
  ADD COLUMN IF NOT EXISTS error_message text;

-- ── 2. Delivery tracking on automation_queue ─────────────────
ALTER TABLE automation_queue
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at      timestamptz,
  ADD COLUMN IF NOT EXISTS replied_at   timestamptz;

-- ── 3. Index on automation_queue.whatsapp_message_id ─────────
-- Queried on every status webhook — needs to be fast
CREATE INDEX IF NOT EXISTS idx_automation_queue_message_id
  ON automation_queue(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;

-- ── 4. Add meta_message_id to broadcast_recipients ────────────
-- Alias alongside provider_msg_id for clarity — populated at send time.
-- Unique index enables O(1) lookup on every status webhook.
ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS meta_message_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_broadcast_recipients_meta_message_id
  ON broadcast_recipients(meta_message_id)
  WHERE meta_message_id IS NOT NULL;

-- ── 5. Add phone + error columns to broadcast_recipients ──────
-- phone: needed for reply tracking without joining contacts
-- error_*: surface failed sends in analytics UI
ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS error_code    text,
  ADD COLUMN IF NOT EXISTS error_message text;

-- ── 6. Atomic counter increment helper ───────────────────────
-- Called inside process_message_status — avoids read-modify-write race.
-- Column names match broadcasts table: delivered, opened, replied.
CREATE OR REPLACE FUNCTION public.increment_broadcast_counter(
  p_broadcast_id uuid,
  p_column       text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  EXECUTE format(
    'UPDATE broadcasts SET %I = %I + 1, updated_at = now() WHERE id = $1',
    p_column, p_column
  ) USING p_broadcast_id;
END;
$$;

-- ── 7. Central status-update RPC ─────────────────────────────
-- Called from the webhook handler for every Meta status event.
-- Lookup order: broadcast_recipients → automation_queue → messages.
-- Returns which table was matched: 'broadcast' | 'automation' | 'inbox' | 'not_found'.
-- Uses COALESCE to prevent overwriting already-set timestamps (idempotent).
-- Sets delivered_at even on 'read' events in case Meta skipped 'delivered'.
CREATE OR REPLACE FUNCTION public.process_message_status(
  p_meta_message_id text,
  p_status          text,
  p_timestamp       timestamptz,
  p_error_code      text DEFAULT NULL,
  p_error_message   text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_broadcast_id uuid;
  v_current_status text;
  v_status_priority int;
  v_current_priority int;
BEGIN
  -- Status priority: higher number wins — never downgrade (e.g. read → delivered)
  v_status_priority := CASE p_status
    WHEN 'sent'      THEN 1
    WHEN 'delivered' THEN 2
    WHEN 'read'      THEN 3
    WHEN 'failed'    THEN 0
    ELSE 0
  END;

  -- ── Try broadcast_recipients ──────────────────────────────
  SELECT status INTO v_current_status
    FROM broadcast_recipients
   WHERE meta_message_id = p_meta_message_id
   LIMIT 1;

  IF FOUND THEN
    v_current_priority := CASE v_current_status
      WHEN 'sent'      THEN 1
      WHEN 'delivered' THEN 2
      WHEN 'read'      THEN 3
      WHEN 'replied'   THEN 4
      ELSE 0
    END;

    -- Only update if this is a status progression
    IF v_status_priority > v_current_priority OR p_status = 'failed' THEN
      UPDATE broadcast_recipients
         SET status        = p_status,
             -- delivered: set if not already set
             delivered_at  = CASE WHEN p_status IN ('delivered', 'read')
                                  THEN COALESCE(delivered_at, p_timestamp)
                                  ELSE delivered_at END,
             -- read: set if not already set
             read_at       = CASE WHEN p_status = 'read'
                                  THEN COALESCE(read_at, p_timestamp)
                                  ELSE read_at END,
             failed_at     = CASE WHEN p_status = 'failed'
                                  THEN COALESCE(failed_at, p_timestamp)
                                  ELSE failed_at END,
             error_code    = COALESCE(p_error_code, error_code),
             error_message = COALESCE(p_error_message, error_message),
             updated_at    = now()
       WHERE meta_message_id = p_meta_message_id
       RETURNING broadcast_id INTO v_broadcast_id;

      -- Increment denormalized counter on broadcasts row
      IF p_status = 'delivered' THEN
        PERFORM public.increment_broadcast_counter(v_broadcast_id, 'delivered');
      ELSIF p_status = 'read' THEN
        PERFORM public.increment_broadcast_counter(v_broadcast_id, 'opened');
      END IF;
    END IF;

    RETURN 'broadcast';
  END IF;

  -- ── Try automation_queue ──────────────────────────────────
  UPDATE automation_queue
     SET delivered_at = CASE WHEN p_status IN ('delivered', 'read')
                              THEN COALESCE(delivered_at, p_timestamp)
                              ELSE delivered_at END,
         read_at      = CASE WHEN p_status = 'read'
                              THEN COALESCE(read_at, p_timestamp)
                              ELSE read_at END
   WHERE whatsapp_message_id = p_meta_message_id;

  IF FOUND THEN RETURN 'automation'; END IF;

  -- ── Try inbox messages ────────────────────────────────────
  UPDATE messages
     SET status        = CASE WHEN p_status IN ('delivered','read','failed')
                               AND status != 'read'  -- never downgrade from read
                              THEN p_status
                              ELSE status END,
         delivered_at  = CASE WHEN p_status IN ('delivered', 'read')
                              THEN COALESCE(delivered_at, p_timestamp)
                              ELSE delivered_at END,
         read_at       = CASE WHEN p_status = 'read'
                              THEN COALESCE(read_at, p_timestamp)
                              ELSE read_at END,
         failed_at     = CASE WHEN p_status = 'failed'
                              THEN COALESCE(failed_at, p_timestamp)
                              ELSE failed_at END,
         error_code    = COALESCE(p_error_code, error_code),
         error_message = COALESCE(p_error_message, error_message)
   WHERE meta_message_id = p_meta_message_id;

  IF FOUND THEN RETURN 'inbox'; END IF;

  RETURN 'not_found';
END;
$$;

-- ── 8. Reply tracking RPC ────────────────────────────────────
-- Called when an inbound message arrives.
-- Marks the most recent automation_queue item for this phone as replied
-- if it was sent within the last 48 hours.
CREATE OR REPLACE FUNCTION public.mark_automation_replied(
  p_user_id text,
  p_phone   text,
  p_replied_at timestamptz DEFAULT now()
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_found boolean := false;
BEGIN
  UPDATE automation_queue
     SET replied_at = COALESCE(replied_at, p_replied_at)
   WHERE user_id = p_user_id::uuid
     AND recipient_phone = p_phone
     AND status = 'sent'
     AND sent_at > (now() - interval '48 hours')
     AND replied_at IS NULL
     AND event_type NOT IN ('cod_confirmation', 'cod_timeout');  -- COD replies handled separately

  GET DIAGNOSTICS v_found = ROW_COUNT;
  RETURN v_found > 0;
END;
$$;
