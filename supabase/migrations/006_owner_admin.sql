-- Makes the site owner a system administrator.
--
-- The PASSWORD is intentionally NOT stored anywhere in this repository.
-- Do these two steps in order:
--
--   1) Supabase Dashboard -> Authentication -> Users -> "Add user" -> "Create new user"
--      Email:    b.w008833@gmail.com
--      Password: (choose it there; tick "Auto Confirm User")
--
--   2) Run this file once in the SQL editor. It links that login to a matchmaker row
--      with is_admin = true, which is what the site checks after signing in.
--
-- Safe to run again.

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE email = 'b.w008833@gmail.com' LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email b.w008833@gmail.com yet. Create it first in Authentication -> Users (step 1).';
  END IF;

  INSERT INTO matchmakers (user_id, email, first_name, last_name, organization, phone, is_admin)
  VALUES (owner_id, 'b.w008833@gmail.com', 'מנהל', 'האתר', 'בונים עולמות', '0533790008', true)
  ON CONFLICT (email) DO UPDATE
    SET user_id  = EXCLUDED.user_id,
        is_admin = true;
END $$;
