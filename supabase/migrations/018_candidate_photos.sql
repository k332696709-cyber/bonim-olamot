-- One row per candidate photo, so the administrator can approve or reject each photo separately
-- and the candidate sees five slots, each with its own status.
-- Writes happen on the server (service role); candidates read their own rows, staff read all.

create table if not exists public.candidate_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gender text not null check (gender in ('male','female')),
  position smallint not null check (position between 0 and 4),
  path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, position)
);

alter table public.candidate_photos enable row level security;

drop policy if exists "candidate reads own photos" on public.candidate_photos;
create policy "candidate reads own photos" on public.candidate_photos
  for select using (user_id = auth.uid());

drop policy if exists "staff reads photos" on public.candidate_photos;
create policy "staff reads photos" on public.candidate_photos
  for select using (public.is_staff());

drop policy if exists "admins update photos" on public.candidate_photos;
create policy "admins update photos" on public.candidate_photos
  for update using (public.is_site_admin()) with check (public.is_site_admin());

-- Move existing registrations' photos into the new table (main photo = position 0, extras follow).
insert into public.candidate_photos (user_id, gender, position, path, status, reviewed_at)
select user_id, 'male', 0, photo_path, photo_status, photo_reviewed_at
from public.male_registrations where user_id is not null and coalesce(photo_path, '') <> ''
on conflict do nothing;
insert into public.candidate_photos (user_id, gender, position, path, status, reviewed_at)
select user_id, 'female', 0, photo_path, photo_status, photo_reviewed_at
from public.female_registrations where user_id is not null and coalesce(photo_path, '') <> ''
on conflict do nothing;
insert into public.candidate_photos (user_id, gender, position, path, status, reviewed_at)
select r.user_id, 'male', (t.ord)::smallint, t.p, r.photo_status, r.photo_reviewed_at
from public.male_registrations r, unnest(r.extra_photo_paths) with ordinality as t(p, ord)
where r.user_id is not null and t.ord <= 4
on conflict do nothing;
insert into public.candidate_photos (user_id, gender, position, path, status, reviewed_at)
select r.user_id, 'female', (t.ord)::smallint, t.p, r.photo_status, r.photo_reviewed_at
from public.female_registrations r, unnest(r.extra_photo_paths) with ordinality as t(p, ord)
where r.user_id is not null and t.ord <= 4
on conflict do nothing;

-- Storage: read access now follows the per-photo rows (the old rules only covered the main photo).
drop policy if exists "candidate reads own photo" on storage.objects;
create policy "candidate reads own photo" on storage.objects
  for select using (
    bucket_id = 'registration-photos'
    and exists (select 1 from public.candidate_photos p where p.user_id = auth.uid() and p.path = objects.name)
  );

drop policy if exists "matchmakers read registration photos" on storage.objects;
create policy "matchmakers read registration photos" on storage.objects
  for select using (
    bucket_id = 'registration-photos'
    and public.is_staff()
    and exists (select 1 from public.candidate_photos p where p.path = objects.name and p.status = 'approved')
  );
