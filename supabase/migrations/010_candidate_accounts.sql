-- Candidate accounts: each man/woman who registers gets a login (email + the password they
-- chose). They can see only their own registration, and only after the administrator
-- approves it (adds it to profiles) their full profile and photo.
-- Needs migrations 003, 004 and 009. Run once in the Supabase SQL editor.

ALTER TABLE male_registrations   ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE female_registrations ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS uq_male_registrations_user   ON male_registrations (user_id)   WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_female_registrations_user ON female_registrations (user_id) WHERE user_id IS NOT NULL;

-- A candidate reads their own registration row (status = profile_id is null or not).
DROP POLICY IF EXISTS "candidate reads own registration" ON male_registrations;
CREATE POLICY "candidate reads own registration" ON male_registrations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "candidate reads own registration" ON female_registrations;
CREATE POLICY "candidate reads own registration" ON female_registrations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Once approved, a candidate reads only their own profile row.
DROP POLICY IF EXISTS "candidate reads own profile" ON profiles;
CREATE POLICY "candidate reads own profile" ON profiles
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT profile_id FROM male_registrations   WHERE user_id = auth.uid() AND profile_id IS NOT NULL)
    OR id IN (SELECT profile_id FROM female_registrations WHERE user_id = auth.uid() AND profile_id IS NOT NULL)
  );

-- A candidate can view their own photo (after approval it is also on their profile).
DROP POLICY IF EXISTS "candidate reads own photo" ON storage.objects;
CREATE POLICY "candidate reads own photo" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'registration-photos'
    AND (
      EXISTS (SELECT 1 FROM public.male_registrations   r WHERE r.user_id = auth.uid() AND r.photo_path = storage.objects.name)
      OR EXISTS (SELECT 1 FROM public.female_registrations r WHERE r.user_id = auth.uid() AND r.photo_path = storage.objects.name)
    )
  );
