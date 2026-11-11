-- Candidates now have logins, so "any authenticated user" is no longer "staff".
-- Restrict the matchmakers' channel and the profiles table to signed-in matchmakers/admin.
-- (Candidates keep reading only their own profile through the existing own-profile policy.)

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.matchmakers m where m.user_id = auth.uid())
$$;

drop policy if exists "profiles: all matchmakers can read" on public.profiles;
create policy "profiles: staff read" on public.profiles
  for select using (public.is_staff());

drop policy if exists "posts: all read" on public.social_posts;
create policy "posts: staff read" on public.social_posts
  for select using (public.is_staff());

-- Delete: your own message, or any message for the site admin.
drop policy if exists "posts: own delete" on public.social_posts;
create policy "posts: own delete" on public.social_posts
  for delete using (
    author_id in (select id from public.matchmakers where user_id = auth.uid())
    or public.is_site_admin()
  );
