-- Announcements of engaged couples ("שידוכים שנסגרו") shown on the home page.
-- Anyone can submit one (it waits for approval); one is also prepared automatically when a match
-- reaches the "closing" stage. Only approved ones are public.
create table if not exists public.engagements (
  id              uuid primary key default gen_random_uuid(),
  groom_name      text not null,
  groom_father    text,
  groom_community text,
  groom_city      text,
  bride_name      text not null,
  bride_father    text,
  bride_community text,
  bride_city      text,
  engaged_on      date not null default current_date,
  status          text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  source          text not null default 'form' check (source in ('form', 'match', 'demo')),
  match_id        uuid references public.matches(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists engagements_status_idx on public.engagements (status, engaged_on desc);

alter table public.engagements enable row level security;

drop policy if exists "engagements: public reads published" on public.engagements;
create policy "engagements: public reads published" on public.engagements
  for select using (status = 'published');

drop policy if exists "engagements: staff all" on public.engagements;
create policy "engagements: staff all" on public.engagements
  for all using (public.is_staff()) with check (public.is_staff());

-- When a match reaches "closing", prepare an announcement (waiting for approval) from the profiles.
create or replace function public.engagement_from_match() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  f record;
  m record;
begin
  if new.stage = 'closing' and (tg_op = 'INSERT' or old.stage is distinct from 'closing') then
    if not exists (select 1 from public.engagements where match_id = new.id) then
      select first_name, last_name, city, community into f from public.profiles where id = new.female_id;
      select first_name, last_name, city, community into m from public.profiles where id = new.male_id;
      insert into public.engagements
        (groom_name, groom_city, groom_community, bride_name, bride_city, bride_community, status, source, match_id)
      values
        (trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), m.city, m.community,
         trim(coalesce(f.first_name, '') || ' ' || coalesce(f.last_name, '')), f.city, f.community,
         'pending', 'match', new.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_engagement_from_match on public.matches;
create trigger trg_engagement_from_match
  after insert or update of stage on public.matches
  for each row execute function public.engagement_from_match();
