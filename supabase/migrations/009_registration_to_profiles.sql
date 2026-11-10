-- Bridge between website registrations and the matchmakers' profiles.
-- Needs is_site_admin() (003). Run once in the Supabase SQL editor.

-- Which profile a registration was turned into (null = not added yet).
ALTER TABLE male_registrations   ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE female_registrations ADD COLUMN IF NOT EXISTS profile_id uuid;

-- Administrators can update and delete registrations (add to profiles / remove).
DROP POLICY IF EXISTS "admins update registrations" ON male_registrations;
CREATE POLICY "admins update registrations" ON male_registrations
  FOR UPDATE TO authenticated USING (is_site_admin()) WITH CHECK (is_site_admin());
DROP POLICY IF EXISTS "admins delete registrations" ON male_registrations;
CREATE POLICY "admins delete registrations" ON male_registrations
  FOR DELETE TO authenticated USING (is_site_admin());

DROP POLICY IF EXISTS "admins update registrations" ON female_registrations;
CREATE POLICY "admins update registrations" ON female_registrations
  FOR UPDATE TO authenticated USING (is_site_admin()) WITH CHECK (is_site_admin());
DROP POLICY IF EXISTS "admins delete registrations" ON female_registrations;
CREATE POLICY "admins delete registrations" ON female_registrations
  FOR DELETE TO authenticated USING (is_site_admin());

-- Photos: administrators can delete them; approved matchmakers can view them
-- (so a candidate's photo shows on their profile).
DROP POLICY IF EXISTS "admins delete registration photos" ON storage.objects;
CREATE POLICY "admins delete registration photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'registration-photos' AND is_site_admin());

DROP POLICY IF EXISTS "matchmakers read registration photos" ON storage.objects;
CREATE POLICY "matchmakers read registration photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'registration-photos'
    AND EXISTS (SELECT 1 FROM public.matchmakers m WHERE m.user_id = auth.uid())
  );
