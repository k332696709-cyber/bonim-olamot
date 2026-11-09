-- Male registration questionnaire (copied from the Tally form).
-- Run this once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS male_registrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  answers     jsonb       NOT NULL,   -- every question id -> the candidate's answer
  photo_path  text        NOT NULL    -- path inside the registration-photos bucket
);

ALTER TABLE male_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone visiting the site may submit the form; only signed-in matchmakers may read.
DROP POLICY IF EXISTS "anyone can register" ON male_registrations;
CREATE POLICY "anyone can register" ON male_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "matchmakers read registrations" ON male_registrations;
CREATE POLICY "matchmakers read registrations" ON male_registrations
  FOR SELECT TO authenticated USING (true);

-- Private bucket for the matchmaking photo (10 MB, images only).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('registration-photos', 'registration-photos', false, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anyone can upload registration photo" ON storage.objects;
CREATE POLICY "anyone can upload registration photo" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'registration-photos');

DROP POLICY IF EXISTS "matchmakers read registration photos" ON storage.objects;
CREATE POLICY "matchmakers read registration photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'registration-photos');
