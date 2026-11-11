-- Detailed regions for date spots (replaces the four broad ones in the app).
-- Run in two steps: Postgres cannot use a new enum value in the same transaction that adds it.
-- Step 1:
alter type public.spot_region add value if not exists 'upper_galilee';
alter type public.spot_region add value if not exists 'golan';
alter type public.spot_region add value if not exists 'kinneret';
alter type public.spot_region add value if not exists 'lower_galilee';
alter type public.spot_region add value if not exists 'haifa';
alter type public.spot_region add value if not exists 'krayot';
alter type public.spot_region add value if not exists 'western_galilee';
alter type public.spot_region add value if not exists 'sharon';
alter type public.spot_region add value if not exists 'gush_dan';
alter type public.spot_region add value if not exists 'shfela';
alter type public.spot_region add value if not exists 'samaria';
alter type public.spot_region add value if not exists 'judea';
alter type public.spot_region add value if not exists 'lachish';
alter type public.spot_region add value if not exists 'negev';
alter type public.spot_region add value if not exists 'dead_sea';
alter type public.spot_region add value if not exists 'arava';

-- Step 2 (separate run): move rows that still use the old broad regions.
-- update public.date_spots set region = 'gush_dan' where region::text = 'center';
-- update public.date_spots set region = 'kinneret' where region::text = 'north';
-- update public.date_spots set region = 'negev'    where region::text = 'south';
