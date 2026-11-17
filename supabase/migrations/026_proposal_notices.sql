-- Which suggestions a candidate was already told about, so the daily check only announces new ones.
-- Only the server (service role) reads and writes it.
create table if not exists public.proposal_notices (
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  proposal_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, proposal_id)
);

alter table public.proposal_notices enable row level security;
