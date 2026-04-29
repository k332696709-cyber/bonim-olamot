-- ============================================================
--  Bonim Olamot – Seed / Sample Data  (development only)
--  Migration: 002_seed_data.sql
--  Run ONLY in a development / staging Supabase project.
-- ============================================================

-- Sample matchmaker (no auth.users link — for local dev without Auth)
INSERT INTO matchmakers (id, email, first_name, last_name, organization, is_admin)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'admin@bonim-olamot.co.il', 'שרה', 'לוי', 'בונים עולמות', true),
  ('11111111-0000-0000-0000-000000000002', 'matchmaker2@bonim-olamot.co.il', 'רחל', 'כהן', 'שידוכים בלב', false)
ON CONFLICT (id) DO NOTHING;

-- Sample female profile
INSERT INTO profiles (
  id, matchmaker_id, gender, first_name, last_name, age,
  city, community, occupation, style, partner_style,
  traits, relationship_values, brings,
  about_me, about_partner, matchmaker_status
) VALUES (
  '22222222-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'female', 'מיכל', 'ברקוביץ', 24,
  'ירושלים', 'גילה', 'מורה', 'open_ish', 'open_ish',
  ARRAY['calm', 'deep', 'communicative'],
  ARRAY['family', 'emotional', 'depth'],
  ARRAY['stability', 'homey', 'communication'],
  'אני אוהבת ספרים, מוזיקה וטיולים בטבע.',
  'מחפשת בן זוג יציב, חם ועם חוש הומור.',
  'green'
);

-- Sample male profile
INSERT INTO profiles (
  id, matchmaker_id, gender, first_name, last_name, age,
  city, community, occupation, style, partner_style,
  traits, relationship_values, brings,
  about_me, about_partner, matchmaker_status
) VALUES (
  '22222222-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000001',
  'male', 'דוד', 'שפירא', 27,
  'תל אביב', 'רמת אביב', 'מהנדס', 'modern', 'open_ish',
  ARRAY['happy', 'social', 'proactive'],
  ARRAY['aspirations', 'stability', 'worldview'],
  ARRAY['reliability', 'depth', 'commitment'],
  'אני עובד בהייטק, אוהב ספורט וטיולים.',
  'מחפש בחורה עם ערכים, שיש לה חיים משלה.',
  'green'
);

-- Sample date spots
INSERT INTO date_spots (name, city, region, category, vibe, kosher, price_range)
VALUES
  ('קפה נמרוד', 'ירושלים', 'jerusalem', 'restaurant', 'שקט ומיוחד', true, '₪₪'),
  ('לובי מלון המלך דוד', 'ירושלים', 'jerusalem', 'hotel_lobby', 'יוקרתי ושקט', true, '₪₪₪'),
  ('פארק הירקון', 'תל אביב', 'center', 'park', 'פתוח ורענן', null, '₪'),
  ('קפה בוגרשוב', 'תל אביב', 'center', 'quiet', 'שקט ואינטימי', true, '₪₪')
ON CONFLICT DO NOTHING;
