-- Female registration questionnaire (copied from the Tally form).
-- Run after 003_male_registrations.sql (it shares the registration-photos bucket).
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS female_registrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  answers     jsonb       NOT NULL,
  photo_path  text        NOT NULL
);

ALTER TABLE female_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can register" ON female_registrations;
CREATE POLICY "anyone can register" ON female_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admins read registrations" ON female_registrations;
CREATE POLICY "admins read registrations" ON female_registrations
  FOR SELECT TO authenticated USING (is_admin());
