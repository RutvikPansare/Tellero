-- ============================================================
-- Migration 18 — Razorpay Billing (Feature 12)
-- Adds billing columns to profiles and creates supporting tables.
-- Plan column already exists on profiles from initial migration.
-- ============================================================

-- ── 1. Add billing columns to profiles ───────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'active'
    CHECK (plan_status IN ('active', 'past_due', 'cancelled', 'trialing')),
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id text,
  ADD COLUMN IF NOT EXISTS razorpay_customer_id text,
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS plan_updated_at timestamptz DEFAULT now();

-- Safety: ensure no null plans exist
UPDATE profiles SET plan = 'free' WHERE plan IS NULL;

-- ── 2. Razorpay plans lookup table ──────────────────────────
CREATE TABLE IF NOT EXISTS razorpay_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL UNIQUE
    CHECK (plan_name IN ('starter', 'growth', 'scale')),
  razorpay_plan_id text NOT NULL,
  price_inr integer NOT NULL,       -- in paise (99900 = ₹999)
  interval text DEFAULT 'monthly',
  created_at timestamptz DEFAULT now()
);

-- ── 3. Billing events log ────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  razorpay_payload jsonb,
  processed boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id
  ON billing_events(user_id, created_at DESC);

-- ── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE razorpay_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Plans are read-only for everyone
CREATE POLICY "razorpay_plans: public read"
  ON razorpay_plans FOR SELECT USING (true);

-- Billing events: owner only
CREATE POLICY "billing_events: owner select"
  ON billing_events FOR SELECT
  USING (auth.uid() = user_id);
