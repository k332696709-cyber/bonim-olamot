-- Matchmaker join requests. A new matchmaker registers on the site, the system creates
-- their login (no access yet) and a pending request; the administrator approves or
-- rejects it from the site (Team page). Approving adds the matchmakers row that grants access.
-- Needs is_site_admin() (created by 003). Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS matchmaker_applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  user_id           uuid        NOT NULL,
  email             text        NOT NULL UNIQUE,
  first_name        text        NOT NULL,
  last_name         text        NOT NULL,
  phone             text        NOT NULL,
  id_number         text,
  years_experience  integer,
  sectors           text[]      NOT NULL DEFAULT '{}',
  status            text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_matchmaker_applications_status ON matchmaker_applications (status, created_at DESC);

ALTER TABLE matchmaker_applications ENABLE ROW LEVEL SECURITY;

-- Requests are written by the server (service role), so there is no public insert policy.
-- Only administrators can read and review them.
DROP POLICY IF EXISTS "admins read applications" ON matchmaker_applications;
CREATE POLICY "admins read applications" ON matchmaker_applications
  FOR SELECT TO authenticated USING (is_site_admin());

DROP POLICY IF EXISTS "admins update applications" ON matchmaker_applications;
CREATE POLICY "admins update applications" ON matchmaker_applications
  FOR UPDATE TO authenticated USING (is_site_admin()) WITH CHECK (is_site_admin());

DROP POLICY IF EXISTS "admins delete applications" ON matchmaker_applications;
CREATE POLICY "admins delete applications" ON matchmaker_applications
  FOR DELETE TO authenticated USING (is_site_admin());
