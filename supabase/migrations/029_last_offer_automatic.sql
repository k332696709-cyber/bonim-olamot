-- The "last offer" date of a candidate now updates by itself: when a match is opened for them, and when a
-- match moves to "proposal sent". The traffic light on the matchmakers' dashboard is computed from it.
create or replace function public.touch_last_offer() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or (new.stage = 'proposal_sent' and old.stage is distinct from 'proposal_sent') then
    update public.profiles set last_offer_date = now() where id in (new.female_id, new.male_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_touch_last_offer on public.matches;
create trigger trg_touch_last_offer
  after insert or update of stage on public.matches
  for each row execute function public.touch_last_offer();

-- Matches that already exist: their candidates count as having received an offer on that date.
update public.profiles p
set last_offer_date = m.last_date
from (
  select pid, max(created_at) as last_date from (
    select female_id as pid, created_at from public.matches
    union all
    select male_id as pid, created_at from public.matches
  ) x group by pid
) m
where p.id = m.pid and (p.last_offer_date is null or p.last_offer_date < m.last_date);
