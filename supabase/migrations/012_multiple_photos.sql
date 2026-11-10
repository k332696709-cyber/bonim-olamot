-- Up to 5 photos per candidate: photo_path stays the main photo, extra photos go here.
alter table public.male_registrations   add column if not exists extra_photo_paths text[] not null default '{}';
alter table public.female_registrations add column if not exists extra_photo_paths text[] not null default '{}';
