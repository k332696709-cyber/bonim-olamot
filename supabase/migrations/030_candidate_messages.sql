-- Messages between a matchmaker (or the administrator) and a candidate, written on the site.
-- A conversation is the pair (candidate, matchmaker). Only the server reads and writes this table, so no
-- policy is added: nobody gets direct access.
create table if not exists public.candidate_messages (
  id                uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  matchmaker_id     uuid not null references public.matchmakers(id) on delete cascade,
  from_candidate    boolean not null default false,
  body              text not null check (char_length(body) between 1 and 2000),
  created_at        timestamptz not null default now(),
  -- when the person it was written to read it
  read_at           timestamptz
);

create index if not exists candidate_messages_thread_idx
  on public.candidate_messages (candidate_user_id, matchmaker_id, created_at);

alter table public.candidate_messages enable row level security;
