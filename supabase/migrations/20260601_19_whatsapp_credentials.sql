-- Add WhatsApp Business API credentials to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS waba_id           text,
  ADD COLUMN IF NOT EXISTS meta_access_token text;
