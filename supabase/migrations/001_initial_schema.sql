-- ============================================================
--  Bonim Olamot – Initial Schema
--  Migration: 001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────

CREATE TYPE gender_type AS ENUM ('male', 'female');

CREATE TYPE matchmaker_status_type AS ENUM ('green', 'orange', 'light_red', 'bright_red');

CREATE TYPE match_stage AS ENUM (
  'checking',
  'proposal_sent',
  'meeting_1',
  'meeting_2',
  'closing'
);

CREATE TYPE match_status AS ENUM ('active', 'closed', 'rejected');

CREATE TYPE spot_category AS ENUM ('restaurant', 'hotel_lobby', 'park', 'quiet');

CREATE TYPE spot_region AS ENUM ('jerusalem', 'center', 'north', 'south');

CREATE TYPE price_range AS ENUM ('₪', '₪₪', '₪₪₪');

-- ─────────────────────────────────────────
--  MATCHMAKERS
-- ─────────────────────────────────────────

CREATE TABLE matchmakers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Supabase Auth link
  email         TEXT NOT NULL UNIQUE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  organization  TEXT,
  phone         TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
--  PROFILES  (candidates — male & female)
-- ─────────────────────────────────────────

CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matchmaker_id       UUID REFERENCES matchmakers(id) ON DELETE SET NULL,

  -- Core identity
  gender              gender_type NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  age                 INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
  hebrew_birthday     TEXT,
  marital_status      TEXT,          -- single, divorced, widowed …
  has_children        BOOLEAN NOT NULL DEFAULT false,
  number_of_children  INTEGER,

  -- Location & contact
  city                TEXT,
  community           TEXT,
  phone               TEXT,
  email               TEXT,
  occupation          TEXT,

  -- Religious / lifestyle profile
  style               TEXT,          -- e.g. shmura, open_ish, modern …
  partner_style       TEXT,
  preferred_stream    TEXT,
  clothing            TEXT,
  headcovering        TEXT,          -- females only
  partner_clothing    TEXT,
  phone_type          TEXT,          -- kosher, filtered, smartphone …

  -- Personality arrays (stored as text arrays)
  traits              TEXT[] NOT NULL DEFAULT '{}',
  relationship_values TEXT[] NOT NULL DEFAULT '{}',
  brings              TEXT[] NOT NULL DEFAULT '{}',

  -- Free-text fields
  doesnt_suit         TEXT,
  flexibility         TEXT,
  about_me            TEXT,
  about_partner       TEXT,

  -- Photos (array of URLs/storage paths)
  photos              TEXT[] NOT NULL DEFAULT '{}',

  -- Matchmaker workflow
  matchmaker_status   matchmaker_status_type NOT NULL DEFAULT 'green',
  locked_at           TIMESTAMPTZ,
  locked_by           TEXT,          -- matchmaker email who locked
  last_offer_date     TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
--  PROFILE NOTES  (matchmaker notes on a profile)
-- ─────────────────────────────────────────

CREATE TABLE profile_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matchmaker_id   UUID REFERENCES matchmakers(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
--  MATCHES
-- ─────────────────────────────────────────

CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matchmaker_id   UUID REFERENCES matchmakers(id) ON DELETE SET NULL,
  female_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  male_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage           match_stage NOT NULL DEFAULT 'checking',
  status          match_status NOT NULL DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- prevent duplicate active matches for the same pair
  CONSTRAINT unique_active_pair UNIQUE (female_id, male_id)
);

-- ─────────────────────────────────────────
--  SOCIAL POSTS  (matchmaker hub wall)
-- ─────────────────────────────────────────

CREATE TABLE social_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        UUID REFERENCES matchmakers(id) ON DELETE SET NULL,
  content          TEXT NOT NULL,
  tagged_profiles  JSONB NOT NULL DEFAULT '[]',   -- [{id, name, gender}]
  is_announcement  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
--  DATE SPOTS
-- ─────────────────────────────────────────

CREATE TABLE date_spots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  region          spot_region NOT NULL,
  category        spot_category NOT NULL,
  vibe            TEXT,
  address         TEXT,
  google_maps_url TEXT,
  kosher          BOOLEAN,
  price_range     price_range,
  average_rating  NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE date_spot_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id      UUID NOT NULL REFERENCES date_spots(id) ON DELETE CASCADE,
  reviewer_id  UUID REFERENCES matchmakers(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_profiles_matchmaker ON profiles(matchmaker_id);
CREATE INDEX idx_profiles_gender      ON profiles(gender);
CREATE INDEX idx_profiles_status      ON profiles(matchmaker_status);
CREATE INDEX idx_matches_matchmaker   ON matches(matchmaker_id);
CREATE INDEX idx_matches_female       ON matches(female_id);
CREATE INDEX idx_matches_male         ON matches(male_id);
CREATE INDEX idx_matches_status       ON matches(status);
CREATE INDEX idx_profile_notes_profile ON profile_notes(profile_id);
CREATE INDEX idx_social_posts_author  ON social_posts(author_id);
CREATE INDEX idx_date_spots_region    ON date_spots(region);
CREATE INDEX idx_date_spots_category  ON date_spots(category);

-- ─────────────────────────────────────────
--  UPDATED_AT TRIGGER
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_matchmakers_updated_at
  BEFORE UPDATE ON matchmakers
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─────────────────────────────────────────
--  DATE-SPOT RATING TRIGGER
--  Keeps average_rating & review_count in sync
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE date_spots
  SET
    average_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM date_spot_reviews WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)),
    review_count   = (SELECT COUNT(*)                        FROM date_spot_reviews WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id))
  WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_sync
  AFTER INSERT OR UPDATE OR DELETE ON date_spot_reviews
  FOR EACH ROW EXECUTE FUNCTION sync_spot_rating();

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE matchmakers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_spots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_spot_reviews ENABLE ROW LEVEL SECURITY;

-- Helper: resolve the matchmakers.id for the current auth user
CREATE OR REPLACE FUNCTION current_matchmaker_id()
RETURNS UUID AS $$
  SELECT id FROM matchmakers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM matchmakers WHERE user_id = auth.uid() LIMIT 1), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── matchmakers ──────────────────────────────────────────────
-- Each matchmaker can read & edit their own row; admins see all
CREATE POLICY "matchmakers: own row"
  ON matchmakers FOR ALL
  USING  (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- ── profiles ─────────────────────────────────────────────────
-- Matchmakers can CRUD their own candidates; admins see all
CREATE POLICY "profiles: own candidates"
  ON profiles FOR ALL
  USING  (matchmaker_id = current_matchmaker_id() OR is_admin())
  WITH CHECK (matchmaker_id = current_matchmaker_id() OR is_admin());

-- All authenticated matchmakers can read each other's profiles
-- (needed for the matchmaking hub / compatibility engine)
CREATE POLICY "profiles: all matchmakers can read"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── profile_notes ─────────────────────────────────────────────
CREATE POLICY "notes: own or admin"
  ON profile_notes FOR ALL
  USING  (matchmaker_id = current_matchmaker_id() OR is_admin())
  WITH CHECK (matchmaker_id = current_matchmaker_id() OR is_admin());

-- ── matches ──────────────────────────────────────────────────
CREATE POLICY "matches: own or admin"
  ON matches FOR ALL
  USING  (matchmaker_id = current_matchmaker_id() OR is_admin())
  WITH CHECK (matchmaker_id = current_matchmaker_id() OR is_admin());

-- ── social_posts ──────────────────────────────────────────────
-- All authenticated users can read; only owner can mutate
CREATE POLICY "posts: all read"
  ON social_posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "posts: own write"
  ON social_posts FOR INSERT
  WITH CHECK (author_id = current_matchmaker_id());

CREATE POLICY "posts: own update/delete"
  ON social_posts FOR UPDATE USING (author_id = current_matchmaker_id() OR is_admin());

-- ── date_spots ───────────────────────────────────────────────
-- Publicly readable; only admins can create/edit spots
CREATE POLICY "spots: public read"
  ON date_spots FOR SELECT USING (true);

CREATE POLICY "spots: admin write"
  ON date_spots FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── date_spot_reviews ─────────────────────────────────────────
CREATE POLICY "reviews: public read"
  ON date_spot_reviews FOR SELECT USING (true);

CREATE POLICY "reviews: authenticated write"
  ON date_spot_reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reviews: own update/delete"
  ON date_spot_reviews FOR UPDATE USING (reviewer_id = current_matchmaker_id() OR is_admin());
