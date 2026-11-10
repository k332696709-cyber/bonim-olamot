-- Photo review instead of per-candidate approval.
-- A candidate's profile is created at registration and visible to them at once; only the
-- photo needs the administrator's approval. Until approved, only the candidate and the
-- administrator can see the photo. Needs migrations 003, 004, 009, 010. Run once.

ALTER TABLE male_registrations
  ADD COLUMN IF NOT EXISTS photo_status text NOT NULL DEFAULT 'pending'
    CHECK (photo_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS photo_reviewed_at timestamptz;

ALTER TABLE female_registrations
  ADD COLUMN IF NOT EXISTS photo_status text NOT NULL DEFAULT 'pending'
    CHECK (photo_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS photo_reviewed_at timestamptz;

-- Matchmakers (and later other users) only see photos the administrator approved.
DROP POLICY IF EXISTS "matchmakers read registration photos" ON storage.objects;
CREATE POLICY "matchmakers read registration photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'registration-photos'
    AND EXISTS (SELECT 1 FROM public.matchmakers m WHERE m.user_id = auth.uid())
    AND (
      EXISTS (SELECT 1 FROM public.male_registrations   r WHERE r.photo_path = storage.objects.name AND r.photo_status = 'approved')
      OR EXISTS (SELECT 1 FROM public.female_registrations r WHERE r.photo_path = storage.objects.name AND r.photo_status = 'approved')
    )
  );
