-- Interest between candidates, recorded by the smart assistant.
-- Only the server (service role) reads and writes it: a candidate must never be able to see who
-- showed interest in them, only the result once both sides are interested.
create table if not exists public.match_interests (
  id              uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id   uuid not null references public.profiles(id) on delete cascade,
  kind            text not null check (kind in ('interested', 'passed')),
  created_at      timestamptz not null default now(),
  unique (from_profile_id, to_profile_id)
);

create index if not exists match_interests_to_idx on public.match_interests (to_profile_id);

alter table public.match_interests enable row level security;

-- Staff can follow mutual interest from the admin area; nobody else gets direct access.
drop policy if exists "match_interests: staff read" on public.match_interests;
create policy "match_interests: staff read" on public.match_interests
  for select using (public.is_staff());
