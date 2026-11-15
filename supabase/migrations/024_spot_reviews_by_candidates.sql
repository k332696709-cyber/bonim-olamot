-- Reviews of date spots written on the site by candidates who went there.
-- The author is shown only as "בחור" / "בחורה"; who wrote it is kept privately so each candidate
-- can leave one review per place and edit it. Reviews are read and written by the server only.
alter table public.date_spot_reviews
  add column if not exists candidate_user_id uuid references auth.users(id) on delete set null,
  add column if not exists author_label text;

create unique index if not exists date_spot_reviews_one_per_candidate
  on public.date_spot_reviews (spot_id, candidate_user_id) where candidate_user_id is not null;

-- No direct access from the browser (the author id must stay private).
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'date_spot_reviews' loop
    execute format('drop policy %I on public.date_spot_reviews', p.policyname);
  end loop;
end $$;
