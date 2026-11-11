-- Date spots managed by the administrator (add / edit / hide / delete from the admin area).
-- The live database already had a date_spots table from the first migration, so this only adds
-- what is missing. Existing rows become hidden (is_published = false) until the admin publishes them;
-- new rows default to published. is_sponsored marks paid partners.
create table if not exists public.date_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default '',
  region text not null check (region in ('jerusalem','center','north','south')),
  category text not null check (category in ('restaurant','hotel_lobby','park','quiet')),
  vibe text not null default '',
  address text,
  google_maps_url text,
  kosher boolean,
  price_range text check (price_range in ('₪','₪₪','₪₪₪')),
  created_at timestamptz not null default now()
);

alter table public.date_spots add column if not exists website_url text;
alter table public.date_spots add column if not exists phone text;
alter table public.date_spots add column if not exists is_published boolean not null default false;
alter table public.date_spots alter column is_published set default true;
alter table public.date_spots add column if not exists is_sponsored boolean not null default false;
alter table public.date_spots add column if not exists sponsor_until date;
alter table public.date_spots add column if not exists admin_notes text;
alter table public.date_spots add column if not exists updated_at timestamptz not null default now();

alter table public.date_spots enable row level security;

drop policy if exists "spots: public read" on public.date_spots;
drop policy if exists "spots: admin write" on public.date_spots;
drop policy if exists "public reads published spots" on public.date_spots;
create policy "public reads published spots" on public.date_spots
  for select using (is_published or public.is_site_admin());

drop policy if exists "admins insert spots" on public.date_spots;
create policy "admins insert spots" on public.date_spots
  for insert with check (public.is_site_admin());

drop policy if exists "admins update spots" on public.date_spots;
create policy "admins update spots" on public.date_spots
  for update using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admins delete spots" on public.date_spots;
create policy "admins delete spots" on public.date_spots
  for delete using (public.is_site_admin());
