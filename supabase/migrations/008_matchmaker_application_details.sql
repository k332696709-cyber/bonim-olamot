-- Richer matchmaker join request (gender, birth date, photo, biography, experience,
-- matches closed, city, specialties, languages) and no national ID number.
-- Run after 007_matchmaker_applications.sql. Run once in the Supabase SQL editor.

ALTER TABLE matchmaker_applications
  ADD COLUMN IF NOT EXISTS gender          text CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS birth_date      date,
  ADD COLUMN IF NOT EXISTS photo_path      text,
  ADD COLUMN IF NOT EXISTS biography       text,
  ADD COLUMN IF NOT EXISTS matches_closed  integer,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS specialties     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages       text;

-- The ID number is no longer collected (privacy), and sectors became "specialties".
ALTER TABLE matchmaker_applications DROP COLUMN IF EXISTS id_number;
ALTER TABLE matchmaker_applications DROP COLUMN IF EXISTS sectors;
