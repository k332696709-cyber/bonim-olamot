-- Messages left through the website's "leave details" contact form.
-- They land in the system administrator's inbox (/matchmaker/inbox).
-- Requires is_site_admin() defined below. Run once in the Supabase SQL editor.


-- Self-contained admin check (works regardless of how earlier migrations named theirs):
-- true when the signed-in user is a matchmaker row with is_admin = true.
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.matchmakers WHERE user_id = auth.uid() LIMIT 1), false);
$$;

CREATE TABLE IF NOT EXISTS contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text        NOT NULL,
  phone       text        NOT NULL,
  subject     text        NOT NULL,
  message     text        NOT NULL,
  is_read     boolean     NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Any visitor can leave a message; only administrators can read, mark or delete.
DROP POLICY IF EXISTS "anyone can send a message" ON contact_messages;
CREATE POLICY "anyone can send a message" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admins read messages" ON contact_messages;
CREATE POLICY "admins read messages" ON contact_messages
  FOR SELECT TO authenticated USING (is_site_admin());

DROP POLICY IF EXISTS "admins update messages" ON contact_messages;
CREATE POLICY "admins update messages" ON contact_messages
  FOR UPDATE TO authenticated USING (is_site_admin()) WITH CHECK (is_site_admin());

DROP POLICY IF EXISTS "admins delete messages" ON contact_messages;
CREATE POLICY "admins delete messages" ON contact_messages
  FOR DELETE TO authenticated USING (is_site_admin());
