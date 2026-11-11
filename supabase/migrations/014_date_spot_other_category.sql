-- "Other" category for date spots (the live column uses the spot_category enum).
alter type public.spot_category add value if not exists 'other';
