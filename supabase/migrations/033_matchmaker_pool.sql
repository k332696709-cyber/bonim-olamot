-- A matchmaker's private pool: candidates they keep for themselves (not on the site, not in the assistant,
-- not visible to other matchmakers or to the administrator). Only the server reads this table.
-- When a match is opened with someone on the site, the entry gets a profile and a match; if the
-- match comes down, the profile is removed and the entry is private again.
create table if not exists public.matchmaker_pool (
  id            uuid primary key default gen_random_uuid(),
  matchmaker_id uuid not null references public.matchmakers(id) on delete cascade,
  gender        text not null check (gender in ('male', 'female')),
  answers       jsonb not null default '{}'::jsonb,
  photo_paths   text[] not null default '{}',
  entered_by    text,
  profile_id    uuid references public.profiles(id) on delete set null,
  match_id      uuid,
  created_at    timestamptz not null default now()
);

create index if not exists matchmaker_pool_owner_idx on public.matchmaker_pool (matchmaker_id, created_at desc);

alter table public.matchmaker_pool enable row level security;
