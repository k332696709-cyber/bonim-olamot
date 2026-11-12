-- The candidate chooses which of their photos is the main one (one per person).
alter table public.candidate_photos add column if not exists is_main boolean not null default false;
create unique index if not exists candidate_photos_one_main on public.candidate_photos (user_id) where is_main;
update public.candidate_photos set is_main = true
where position = 0 and not exists (select 1 from public.candidate_photos m where m.user_id = candidate_photos.user_id and m.is_main);
