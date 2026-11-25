-- A real price range for a date spot (NIS per person), typed by whoever adds the place.
-- The old three-level price_range stays for places that already have it.
alter table public.date_spots
  add column if not exists price_min integer check (price_min is null or (price_min >= 0 and price_min <= 5000)),
  add column if not exists price_max integer check (price_max is null or (price_max >= 0 and price_max <= 5000));
