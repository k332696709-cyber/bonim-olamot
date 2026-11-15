-- Two matchmakers on one match (optional). The matchmaker who opened it can add a colleague,
-- who then sees and works on the match too.
alter table public.matches
  add column if not exists co_matchmaker_id uuid references public.matchmakers(id) on delete set null;

-- A match is visible to, and editable by, its matchmaker, the colleague added to it, and admins.
drop policy if exists "matches: own or admin" on public.matches;
create policy "matches: own or admin" on public.matches
  for all
  using (
    matchmaker_id = current_matchmaker_id()
    or co_matchmaker_id = current_matchmaker_id()
    or is_admin_user()
  )
  with check (
    matchmaker_id = current_matchmaker_id()
    or co_matchmaker_id = current_matchmaker_id()
    or is_admin_user()
  );

-- Matchmakers can see who their colleagues are (name, contact), so a match shows who works on it.
-- Their activity and statistics are not stored here and stay private to each matchmaker.
drop policy if exists "matchmakers: staff read" on public.matchmakers;
create policy "matchmakers: staff read" on public.matchmakers
  for select using (public.is_staff());
